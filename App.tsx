import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Task = { id: string; title: string; subtitle: string; icon: string; xp: number; coins: number; category: string; skill: string };
type Save = { xp: number; coins: number; streak: number; lastHabitDate: string; completed: string[]; habitDone: boolean };
const TASKS: Task[] = [
  { id: "room", title: "Убраться в комнате", subtitle: "Наведи порядок вокруг себя", icon: "🧹", xp: 30, coins: 10, category: "Быт", skill: "Организованность" },
  { id: "study", title: "Сделать домашку", subtitle: "Один шаг к новым знаниям", icon: "📚", xp: 50, coins: 20, category: "Учёба", skill: "Интеллект" },
  { id: "food", title: "Приготовить еду", subtitle: "Приготовь что-нибудь полезное", icon: "🍳", xp: 35, coins: 15, category: "Здоровье", skill: "Кулинария" },
  { id: "sport", title: "Тренировка", subtitle: "Удели время своему телу", icon: "💪", xp: 40, coins: 15, category: "Спорт", skill: "Сила" },
];
const DEFAULT: Save = { xp: 240, coins: 85, streak: 6, lastHabitDate: "", completed: [], habitDone: false };
const today = () => new Date().toISOString().slice(0, 10);
const C = { bg: "#0B1020", panel: "#151F33", panel2: "#1C2941", gold: "#F2C66D", muted: "#91A0B8", text: "#F6F3EC", green: "#69C6A5", line: "#2B3952" };

export default function App() {
  const [save, setSave] = useState<Save>(DEFAULT);
  const [tab, setTab] = useState("quests");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { AsyncStorage.getItem("life-rpg-save").then(raw => { if (raw) { const parsed = JSON.parse(raw) as Save; if (parsed.lastHabitDate !== today()) parsed.habitDone = false; setSave(parsed); } }).catch(() => {}).finally(() => setLoaded(true)); }, []);
  useEffect(() => { if (loaded) AsyncStorage.setItem("life-rpg-save", JSON.stringify(save)).catch(() => {}); }, [save, loaded]);
  const level = Math.floor(save.xp / 300) + 1;
  const progress = save.xp % 300;
  const completedCount = save.completed.length;
  const update = (patch: Partial<Save>) => setSave(s => ({ ...s, ...patch }));
  const finishTask = (task: Task) => {
    if (save.completed.includes(task.id)) return;
    update({ completed: [...save.completed, task.id], xp: save.xp + task.xp, coins: save.coins + task.coins });
  };
  const finishHabit = () => {
    if (save.habitDone) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    update({ habitDone: true, xp: save.xp + 20, coins: save.coins + 10, streak: save.lastHabitDate === yesterday ? save.streak + 1 : 1, lastHabitDate: today() });
  };
  const skills = useMemo(() => [
    { name: "Интеллект", icon: "🧠", level: 3, width: 46 },
    { name: "Сила", icon: "💪", level: 1 + (save.completed.includes("sport") ? 1 : 0), width: 30 },
    { name: "Дисциплина", icon: "🎯", level: Math.max(1, save.streak), width: Math.min(100, save.streak * 12) },
    { name: "Кулинария", icon: "🍳", level: 1 + (save.completed.includes("food") ? 1 : 0), width: 30 },
    { name: "Организованность", icon: "🧹", level: 1 + (save.completed.includes("room") ? 1 : 0), width: 30 },
  ], [save]);
  const resetDay = () => Alert.alert("Новый день", "Сбросить список ежедневных квестов? Прогресс персонажа сохранится.", [{ text: "Отмена", style: "cancel" }, { text: "Сбросить", onPress: () => update({ completed: [], habitDone: false }) }]);
  if (!loaded) return <SafeAreaView style={styles.safe}><Text style={styles.loading}>Загружаем твоё приключение…</Text></SafeAreaView>;
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={styles.header}>
        <View><Text style={styles.brand}>⚔ LIFE RPG</Text><Text style={styles.tagline}>ТВОЯ ЖИЗНЬ — ТВОЯ ИГРА</Text></View>
        <Pressable onPress={resetDay} style={styles.headerButton}><Text style={styles.headerButtonText}>↻</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.avatar}><Text style={{fontSize: 38}}>🧙</Text></View>
            <View style={{flex: 1}}>
              <Text style={styles.eyebrow}>ТВОЙ ПЕРСОНАЖ</Text><Text style={styles.heroName}>Искатель</Text>
              <View style={styles.levelPill}><Text style={styles.levelText}>✦ УРОВЕНЬ {level}</Text></View>
            </View>
            <View style={styles.xpBadge}><Text style={styles.xpValue}>{save.xp}</Text><Text style={styles.xpLabel}>ОБЩИЙ XP</Text></View>
          </View>
          <View style={styles.progressHead}><Text style={styles.mutedSmall}>До следующего уровня</Text><Text style={styles.goldSmall}>{progress}/300 XP</Text></View>
          <View style={styles.track}><View style={[styles.fill, { width: `${progress / 300 * 100}%` }]} /></View>
          <View style={styles.statsRow}>
            <View style={styles.stat}><Text style={styles.statIcon}>🪙</Text><View><Text style={styles.statValue}>{save.coins}</Text><Text style={styles.statLabel}>МОНЕТЫ</Text></View></View>
            <View style={styles.statDivider} />
            <View style={styles.stat}><Text style={styles.statIcon}>🔥</Text><View><Text style={styles.statValue}>{save.streak}</Text><Text style={styles.statLabel}>ДНЕЙ СЕРИИ</Text></View></View>
          </View>
        </View>
        <View style={styles.sectionHead}><View><Text style={styles.sectionTitle}>{tab === "quests" ? "📜 Квесты на сегодня" : tab === "skills" ? "🧬 Навыки персонажа" : tab === "awards" ? "🏆 Достижения" : "🎒 Инвентарь"}</Text><Text style={styles.sectionSub}>{tab === "quests" ? "Маленькие дела = большие победы" : "Каждое действие делает тебя сильнее"}</Text></View>{tab === "quests" && <Text style={styles.counter}>{completedCount}/{TASKS.length}</Text>}</View>
        {tab === "quests" && <>
          {TASKS.map(task => {
            const done = save.completed.includes(task.id);
            return <View key={task.id} style={[styles.task, done && styles.taskDone]}>
              <View style={styles.taskIcon}><Text style={{fontSize: 25}}>{task.icon}</Text></View>
              <View style={{flex: 1}}>
                <Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.taskSub}>{task.subtitle}</Text>
                <Text style={styles.reward}>⭐ +{task.xp} XP   ·   🪙 +{task.coins}</Text>
              </View>
              <Pressable disabled={done} onPress={() => finishTask(task)} style={[styles.completeButton, done && styles.completeDone]}><Text style={[styles.completeText, done && {color: C.green}]}>{done ? "✓" : "Забрать"}</Text></Pressable>
            </View>;
          })}
          <View style={styles.habitCard}>
            <View style={styles.habitTop}><Text style={styles.habitTitle}>🔥 Ежедневная привычка</Text><Text style={styles.streakPill}>{save.streak} ДНЕЙ</Text></View>
            <Text style={styles.habitDesc}>Сделай что-то полезное для себя сегодня. Не прерывай цепочку!</Text>
            <View style={styles.habitBottom}><Text style={styles.reward}>+20 XP · +10 🪙</Text><Pressable onPress={finishHabit} disabled={save.habitDone} style={[styles.habitButton, save.habitDone && styles.completeDone]}><Text style={[styles.habitButtonText, save.habitDone && {color:C.green}]}>{save.habitDone ? "Засчитано ✓" : "Выполнено!"}</Text></Pressable></View>
          </View>
          <Text style={styles.footerHint}>Подсказка: начни с одного небольшого квеста. Главное — регулярность.</Text>
        </>}
        {tab === "skills" && <View style={styles.card}>{skills.map(s => <View key={s.name} style={styles.skillRow}><View style={styles.skillHead}><Text style={styles.skillName}>{s.icon}  {s.name}</Text><Text style={styles.skillLevel}>УР. {s.level}</Text></View><View style={styles.track}><View style={[styles.skillFill,{width:`${s.width}%`}]} /></View></View>)}</View>}
        {tab === "awards" && <View style={{gap:12}}>{[
          {icon:"⚔️",title:"Первый шаг",desc:"Выполни первое задание.",ok:completedCount>0,progress:completedCount>0?"Получено":"Не получено"},
          {icon:"🔥",title:"Железная воля",desc:"Соблюдай привычку 7 дней подряд.",ok:save.streak>=7,progress:`${Math.min(7,save.streak)}/7 дней`},
          {icon:"💰",title:"Первое богатство",desc:"Накопи 100 монет.",ok:save.coins>=100,progress:`${save.coins}/100 монет`},
          {icon:"🌟",title:"Новый уровень",desc:"Достигни 2-го уровня.",ok:level>=2,progress:level>=2?"Получено":`${progress}/300 XP`},
        ].map(a=><View key={a.title} style={styles.award}><Text style={{fontSize:30}}>{a.icon}</Text><View style={{flex:1}}><Text style={styles.taskTitle}>{a.title}</Text><Text style={styles.taskSub}>{a.desc}</Text><Text style={styles.reward}>{a.progress}</Text></View><Text style={{fontSize:20}}>{a.ok?"🏅":"🔒"}</Text></View>)}</View>}
        {tab === "bag" && <View style={styles.card}><Text style={styles.inventoryIcon}>🎒</Text><Text style={styles.heroName}>Рюкзак пока пуст</Text><Text style={styles.habitDesc}>Скоро здесь появятся зелья, экипировка и косметические предметы. Продолжай выполнять квесты!</Text><View style={styles.shopRow}><Text style={styles.taskTitle}>🧪 Зелье энергии</Text><Text style={styles.reward}>50 🪙</Text></View><View style={styles.shopRow}><Text style={styles.taskTitle}>👑 Корона героя</Text><Text style={styles.reward}>100 🪙</Text></View></View>}
      </ScrollView>
      <View style={styles.nav}>
        {[{id:"quests",icon:"⚔️",label:"Квесты"},{id:"skills",icon:"🧬",label:"Навыки"},{id:"awards",icon:"🏆",label:"Награды"},{id:"bag",icon:"🎒",label:"Рюкзак"}].map(item=><Pressable key={item.id} onPress={()=>setTab(item.id)} style={styles.navItem}><Text style={{fontSize:20,opacity:tab===item.id?1:0.55}}>{item.icon}</Text><Text style={[styles.navLabel,tab===item.id&&styles.navActive]}>{item.label}</Text>{tab===item.id&&<View style={styles.navDot}/>}</Pressable>)}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg},loading:{color:C.text,textAlign:"center",marginTop:80,fontSize:16},
  header:{paddingHorizontal:22,paddingTop:10,paddingBottom:15,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},
  brand:{color:C.gold,fontSize:21,fontWeight:"900",letterSpacing:2},tagline:{color:C.muted,fontSize:9,letterSpacing:2,marginTop:3},
  headerButton:{width:40,height:40,borderRadius:14,backgroundColor:C.panel,alignItems:"center",justifyContent:"center"},headerButtonText:{color:C.gold,fontSize:25},
  content:{paddingHorizontal:18,paddingBottom:20,gap:17},
  hero:{backgroundColor:C.panel,borderRadius:24,padding:18,borderWidth:1,borderColor:"#34415A"},
  heroTop:{flexDirection:"row",alignItems:"center",gap:13},avatar:{width:72,height:72,borderRadius:22,backgroundColor:"#2B3852",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"#52617C"},
  eyebrow:{fontSize:9,color:C.muted,letterSpacing:2,fontWeight:"700"},heroName:{fontSize:23,color:C.text,fontWeight:"800",marginTop:3},
  levelPill:{alignSelf:"flex-start",backgroundColor:"#493D2B",paddingHorizontal:9,paddingVertical:4,borderRadius:8,marginTop:6},levelText:{fontSize:10,color:C.gold,fontWeight:"800",letterSpacing:1},
  xpBadge:{alignItems:"flex-end"},xpValue:{color:C.gold,fontSize:22,fontWeight:"900"},xpLabel:{color:C.muted,fontSize:9,letterSpacing:1},
  progressHead:{flexDirection:"row",justifyContent:"space-between",marginTop:20,marginBottom:8},mutedSmall:{fontSize:11,color:C.muted},goldSmall:{fontSize:11,color:C.gold,fontWeight:"700"},
  track:{height:8,backgroundColor:"#303D55",borderRadius:9,overflow:"hidden"},fill:{height:8,backgroundColor:C.gold,borderRadius:9},
  statsRow:{flexDirection:"row",alignItems:"center",marginTop:18,gap:20},stat:{flex:1,flexDirection:"row",alignItems:"center",gap:10},statIcon:{fontSize:23},statValue:{fontSize:18,color:C.text,fontWeight:"800"},statLabel:{fontSize:9,color:C.muted,letterSpacing:1},statDivider:{width:1,height:32,backgroundColor:C.line},
  sectionHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:2},sectionTitle:{fontSize:19,color:C.text,fontWeight:"800"},sectionSub:{fontSize:11,color:C.muted,marginTop:4},counter:{color:C.gold,fontWeight:"800",fontSize:13},
  task:{backgroundColor:C.panel,borderRadius:18,padding:13,flexDirection:"row",alignItems:"center",gap:11,borderWidth:1,borderColor:C.line},taskDone:{opacity:0.72,borderColor:"#31594F"},
  taskIcon:{width:48,height:48,borderRadius:14,backgroundColor:C.panel2,alignItems:"center",justifyContent:"center"},taskTitle:{fontSize:14,color:C.text,fontWeight:"700"},taskSub:{fontSize:10,color:C.muted,marginTop:3},reward:{fontSize:10,color:C.gold,fontWeight:"700",marginTop:8},
  completeButton:{backgroundColor:C.gold,paddingHorizontal:12,paddingVertical:9,borderRadius:11},completeText:{color:"#202033",fontSize:11,fontWeight:"900"},completeDone:{backgroundColor:"#23473F",borderWidth:1,borderColor:"#3D7968"},
  habitCard:{backgroundColor:"#202B40",borderRadius:19,padding:16,borderWidth:1,borderColor:"#5B4A32"},habitTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},habitTitle:{color:C.text,fontWeight:"800",fontSize:15},streakPill:{color:C.gold,fontSize:9,fontWeight:"900",backgroundColor:"#493D2B",padding:7,borderRadius:8},habitDesc:{color:C.muted,fontSize:11,lineHeight:17,marginTop:10},habitBottom:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:10},habitButton:{backgroundColor:C.gold,paddingVertical:9,paddingHorizontal:13,borderRadius:10},habitButtonText:{color:"#202033",fontSize:11,fontWeight:"900"},
  footerHint:{color:"#71809A",fontSize:10,textAlign:"center",lineHeight:16,marginBottom:8},
  card:{backgroundColor:C.panel,borderRadius:18,padding:17,borderWidth:1,borderColor:C.line,gap:18},skillRow:{gap:9},skillHead:{flexDirection:"row",justifyContent:"space-between"},skillName:{color:C.text,fontSize:14,fontWeight:"700"},skillLevel:{color:C.gold,fontSize:10,fontWeight:"800"},skillFill:{height:8,backgroundColor:C.green,borderRadius:9},
  award:{backgroundColor:C.panel,borderRadius:17,padding:15,flexDirection:"row",alignItems:"center",gap:13,borderWidth:1,borderColor:C.line},inventoryIcon:{fontSize:42,textAlign:"center"},shopRow:{borderTopWidth:1,borderTopColor:C.line,paddingTop:14,flexDirection:"row",justifyContent:"space-between"},
  nav:{flexDirection:"row",backgroundColor:"#111A2B",borderTopWidth:1,borderTopColor:C.line,paddingTop:10,paddingBottom:8,paddingHorizontal:8},navItem:{flex:1,alignItems:"center",gap:3},navLabel:{fontSize:9,color:C.muted,fontWeight:"600"},navActive:{color:C.gold},navDot:{width:4,height:4,borderRadius:2,backgroundColor:C.gold}
});