// Comprehensive exercise database with video URLs
// Organized by muscle groups with specific video links

export interface ExerciseData {
  name: string
  muscleGroup: string
  videoUrl: string
  category: 'compound' | 'isolation' | 'cardio' | 'bodyweight'
  equipment: string[]
}

// Complete exercise database with direct video links
const EXERCISE_DATABASE: ExerciseData[] = [
  // BICEPS (16 exercises)
  { name: 'Alternating Dumbbell Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=iixND1P2lik', category: 'isolation', equipment: ['Dumbbells'] },
  { name: 'Barbell Curl Narrow Grip', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=pUS6HBQjRmc', category: 'isolation', equipment: ['Barbell'] },
  { name: 'Barbell Curl Normal Grip', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=JnLFSFurrqQ', category: 'isolation', equipment: ['Barbell'] },
  { name: 'Cable EZ Bar Curl Wide Grip', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=yuozln3CC94', category: 'isolation', equipment: ['Cable Machine', 'EZ Bar'] },
  { name: 'Cable EZ Bar Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=opFVuRi_3b8', category: 'isolation', equipment: ['Cable Machine', 'EZ Bar'] },
  { name: 'Dumbbell Single Arm Preacher Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=fuK3nFvwgXk', category: 'isolation', equipment: ['Dumbbells', 'Preacher Bench'] },
  { name: 'Dumbbell Spider Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=ke2shAeQ0O8', category: 'isolation', equipment: ['Dumbbells', 'Incline Bench'] },
  { name: 'Dumbbell Twist Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=tRXw8HQ7-oA', category: 'isolation', equipment: ['Dumbbells'] },
  { name: 'EZ Bar Curl Narrow Grip', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=cdmnvo3augg', category: 'isolation', equipment: ['EZ Bar'] },
  { name: 'EZ Bar Curl Wide Grip', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=EK747VC37yE', category: 'isolation', equipment: ['EZ Bar'] },
  { name: 'EZ Bar Preacher Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=sxA__DoLsgo', category: 'isolation', equipment: ['EZ Bar', 'Preacher Bench'] },
  { name: 'EZ Bar Spider Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=WG3vdcq__I0', category: 'isolation', equipment: ['EZ Bar', 'Incline Bench'] },
  { name: 'Hammer Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=XOEL4MgekYE', category: 'isolation', equipment: ['Dumbbells'] },
  { name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=aTYlqC_JacQ', category: 'isolation', equipment: ['Dumbbells', 'Incline Bench'] },
  { name: 'Machine Preacher Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=Ja6ZlIDONac', category: 'isolation', equipment: ['Preacher Curl Machine'] },
  { name: 'Rope Twist Curl', muscleGroup: 'Biceps', videoUrl: 'https://www.youtube.com/watch?v=2CDKTFFp5fA', category: 'isolation', equipment: ['Cable Machine', 'Rope'] },

  // CHEST (33 exercises)
  { name: 'Cable Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=4mfLHnFL0Uw', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Cable Bent Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=Cj6P91eFXkM', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Cable Underhand Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=e_8HLu59-to', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Cambered Bar Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=_9VlfuYYC7w', category: 'compound', equipment: ['Cambered Bar', 'Bench'] },
  { name: 'Deficit Pushup', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=gmNlqsE3Onc', category: 'bodyweight', equipment: ['Bodyweight'] },
  { name: 'Flat Dumbbell Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=YQ2s_Y7g5Qk', category: 'compound', equipment: ['Dumbbells', 'Bench'] },
  { name: 'Flat Dumbbell Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=JFm8KbhjibM', category: 'isolation', equipment: ['Dumbbells', 'Bench'] },
  { name: 'Flat Dumbbell Press Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=BhlL-esnitU', category: 'compound', equipment: ['Dumbbells', 'Bench'] },
  { name: 'Flat Hammer Machine Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=aV1U_mK3XOs', category: 'compound', equipment: ['Hammer Strength Machine'] },
  { name: 'Hammer Machine Chest Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=0Wa9CfRXUkA', category: 'compound', equipment: ['Hammer Strength Machine'] },
  { name: 'High Incline Dumbbell Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=GFYrRBoov3w', category: 'compound', equipment: ['Dumbbells', 'Incline Bench'] },
  { name: 'Incline Dumbbell Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=8oR5hBwbIBc', category: 'isolation', equipment: ['Dumbbells', 'Incline Bench'] },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=5CECBjd7HLQ', category: 'compound', equipment: ['Dumbbells', 'Incline Bench'] },
  { name: 'Incline Dumbbell Press Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=lTfiohnjbyM', category: 'compound', equipment: ['Dumbbells', 'Incline Bench'] },
  { name: 'Incline Machine Chest Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=TrTSvn5-MTk', category: 'compound', equipment: ['Chest Press Machine'] },
  { name: 'Incline Medium Grip Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=lJ2o89kcnxY', category: 'compound', equipment: ['Barbell', 'Incline Bench'] },
  { name: 'Incline Narrow Grip Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=Zfi0KcIJi6c', category: 'compound', equipment: ['Barbell', 'Incline Bench'] },
  { name: 'Incline Wide Grip Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=FxQ0XEoFYQk', category: 'compound', equipment: ['Barbell', 'Incline Bench'] },
  { name: 'Low Incline Dumbbell Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=B09ZkYsnKko', category: 'compound', equipment: ['Dumbbells', 'Incline Bench'] },
  { name: 'Machine Chest Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=NwzUje3z0qY', category: 'compound', equipment: ['Chest Press Machine'] },
  { name: 'Machine Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=FDay9wFe5uE', category: 'isolation', equipment: ['Pec Deck Machine'] },
  { name: 'Medium Grip Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=gMgvBspQ9lk', category: 'compound', equipment: ['Barbell', 'Bench'] },
  { name: 'Narrow Pushup', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=Lz1aFtuNvEQ', category: 'bodyweight', equipment: ['Bodyweight'] },
  { name: 'Narrow Grip Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=FiQUzPtS90E', category: 'compound', equipment: ['Barbell', 'Bench'] },
  { name: 'Pec Deck Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=O-OBCfyh9Fw', category: 'isolation', equipment: ['Pec Deck Machine'] },
  { name: 'Pushup', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=mm6_WcoCVTA', category: 'bodyweight', equipment: ['Bodyweight'] },
  { name: 'Smith Machine Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=O5viuEPDXKY', category: 'compound', equipment: ['Smith Machine', 'Bench'] },
  { name: 'Smith Machine Incline Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=8urE8Z8AMQ4', category: 'compound', equipment: ['Smith Machine', 'Incline Bench'] },
  { name: 'Smith Machine Narrow Grip Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=qf_FTh3QyYs', category: 'compound', equipment: ['Smith Machine', 'Bench'] },
  { name: 'Smith Machine Narrow Grip Incline Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=PYijbpxFAv8', category: 'compound', equipment: ['Smith Machine', 'Incline Bench'] },
  { name: 'Smith Machine Wide Grip Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=AK0ycfB_kYo', category: 'compound', equipment: ['Smith Machine', 'Bench'] },
  { name: 'Smith Machine Wide Grip Incline Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=SHL81neluiI', category: 'compound', equipment: ['Smith Machine', 'Incline Bench'] },
  { name: 'Wide Grip Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=EeE3f4VWFDo', category: 'compound', equipment: ['Barbell', 'Bench'] },

  // BACK (33 exercises)
  { name: 'Assisted Normal Grip Pullup', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=8ygapPMYK1I', category: 'compound', equipment: ['Pull-up Bar', 'Resistance Band'] },
  { name: 'Assisted Parallel Pullup', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=GdsRZAeeDUc', category: 'compound', equipment: ['Pull-up Bar', 'Resistance Band'] },
  { name: 'Assisted Underhand Pullup', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=L4ChTwrXTjc', category: 'compound', equipment: ['Pull-up Bar', 'Resistance Band'] },
  { name: 'Assisted Wide Grip Pullup', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=0tiC6RUZL8Y', category: 'compound', equipment: ['Pull-up Bar', 'Resistance Band'] },
  { name: 'Barbell Bent Over Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=6FZHJGzMFEc', category: 'compound', equipment: ['Barbell'] },
  { name: 'Barbell Row to Chest', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=UPGuwx7GQ9s', category: 'compound', equipment: ['Barbell'] },
  { name: 'Cambered Bar Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=jiowkUMomlw', category: 'compound', equipment: ['Cambered Bar'] },
  { name: 'Chest Supported Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=0UBRfiO4zDs', category: 'compound', equipment: ['Incline Bench', 'Dumbbells'] },
  { name: 'Dumbbell Pullover', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=jQjWlIwG4sI', category: 'isolation', equipment: ['Dumbbells', 'Bench'] },
  { name: 'Hammer High Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=gg5hwJuv6KI', category: 'compound', equipment: ['Hammer Strength Machine'] },
  { name: 'Hammer Low Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=opjbouBmUWg', category: 'compound', equipment: ['Hammer Strength Machine'] },
  { name: 'Incline Dumbbell Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=tZUYS7X50so', category: 'compound', equipment: ['Dumbbells', 'Incline Bench'] },
  { name: 'Inverted Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=KOaCM1HMwU0', category: 'bodyweight', equipment: ['Bodyweight', 'Bar'] },
  { name: 'Machine Chest Supported Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=_FrrYQxA6kc', category: 'compound', equipment: ['Row Machine'] },
  { name: 'Machine Pullover', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=oxpAl14EYyc', category: 'isolation', equipment: ['Pullover Machine'] },
  { name: 'Normal Grip Pulldown', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=EUIri47Epcg', category: 'compound', equipment: ['Lat Pulldown Machine'] },
  { name: 'Normal Grip Pullup', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=iWpoegdfgtc', category: 'compound', equipment: ['Pull-up Bar'] },
  { name: 'Parallel Pulldown', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=--utaPT7XYQ', category: 'compound', equipment: ['Lat Pulldown Machine'] },
  { name: 'Parallel Grip Pullup', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=XWt6FQAK5wM', category: 'compound', equipment: ['Pull-up Bar'] },
  { name: 'Seal Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=4H2ItXwUTp8', category: 'compound', equipment: ['Dumbbells', 'Bench'] },
  { name: 'Seated Cable Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=UCXxvVItLoM', category: 'compound', equipment: ['Cable Machine'] },
  { name: 'Two Arm Dumbbell Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=5PoEksoJNaw', category: 'compound', equipment: ['Dumbbells'] },
  { name: 'Single Arm Supported Dumbbell Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=DMo3HJoawrU', category: 'compound', equipment: ['Dumbbells', 'Bench'] },
  { name: 'Smith Machine Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=3QcJggd_L24', category: 'compound', equipment: ['Smith Machine'] },
  { name: 'Straight Arm Pulldown', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=G9uNaXGTJ4w', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'T Bar Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=yPis7nlbqdY', category: 'compound', equipment: ['T-Bar Row Machine'] },
  { name: 'Underhand EZ Bar Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=H260SUUyJBM', category: 'compound', equipment: ['EZ Bar'] },
  { name: 'Underhand Pulldown', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=VprlTxpB1rk', category: 'compound', equipment: ['Lat Pulldown Machine'] },
  { name: 'Wide Grip Pulldown', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=YCKPD4BSD2E', category: 'compound', equipment: ['Lat Pulldown Machine'] },
  { name: 'Wide Grip Pullup', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=GRgWPT9XSQQ', category: 'compound', equipment: ['Pull-up Bar'] },
  { name: 'Underhand Pullup', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=9JC1EwqezGY', category: 'compound', equipment: ['Pull-up Bar'] },
  { name: 'Barbell Flexion Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=Lt3d1UKq7RQ', category: 'compound', equipment: ['Barbell'] },

  // TRICEPS (17 exercises)
  { name: 'Barbell Triceps Overhead Extension', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=q5X9thiKofE', category: 'isolation', equipment: ['Barbell'] },
  { name: 'Assisted Dip', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=yZ83t4mrPrI', category: 'compound', equipment: ['Dip Bars', 'Resistance Band'] },
  { name: 'Barbell Skullcrusher', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=l3rHYPtMUo8', category: 'isolation', equipment: ['Barbell', 'Bench'] },
  { name: 'Cable Overhead Triceps Extension', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=1u18yJELsh0', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Cable Single Arm Pushdown', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=Cp_bShvMY4c', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Cable Triceps Pushdown', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=6Fzep104f0s', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Dip', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=4LA1kF7yCGo', category: 'compound', equipment: ['Dip Bars'] },
  { name: 'Dumbbell Skullcrusher', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=jPjhQ2hsAds', category: 'isolation', equipment: ['Dumbbells', 'Bench'] },
  { name: 'EZ Bar Overhead Triceps Extension', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=IdZ7HXnatko', category: 'isolation', equipment: ['EZ Bar'] },
  { name: 'Inverted Skullcrusher', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=1lrjpLuXH4w', category: 'isolation', equipment: ['Barbell', 'Incline Bench'] },
  { name: 'Machine Triceps Extension', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=Bx8ga1BLHLE', category: 'isolation', equipment: ['Triceps Extension Machine'] },
  { name: 'Machine Triceps Pushdown', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=OChuGyCSC7U', category: 'isolation', equipment: ['Triceps Pushdown Machine'] },
  { name: 'Rope Overhead Triceps Extension', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=kqidUIf1eJE', category: 'isolation', equipment: ['Cable Machine', 'Rope'] },
  { name: 'Rope Pushdown', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=-xa-6cQaZKY', category: 'isolation', equipment: ['Cable Machine', 'Rope'] },
  { name: 'Seated EZ Bar Overhead Triceps Extension', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=gcRZqG8t44c', category: 'isolation', equipment: ['EZ Bar'] },
  { name: 'JM Press', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=Tih5iHyELsE', category: 'compound', equipment: ['Barbell', 'Bench'] },
  { name: 'Seated Barbell Overhead Triceps Extension', muscleGroup: 'Triceps', videoUrl: 'https://www.youtube.com/watch?v=ktU2H0DDmwk', category: 'isolation', equipment: ['Barbell'] },

  // GLUTES (24 exercises)
  { name: 'Barbell Hip Thrust', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=EF7jXP17DPE', category: 'compound', equipment: ['Barbell', 'Bench'] },
  { name: 'Barbell Walking Lunge', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=_meXEWq5MOQ', category: 'compound', equipment: ['Barbell'] },
  { name: 'Cable Pull Through', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=pv8e6OSyETE', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Deadlift', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=AweC3UaM14o', category: 'compound', equipment: ['Barbell'] },
  { name: 'Deficit 25s Deadlift', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=kvWcDHH62j0', category: 'compound', equipment: ['Barbell', 'Deficit Platform'] },
  { name: 'Deficit Deadlift', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=X-uKkAukJVA', category: 'compound', equipment: ['Barbell', 'Deficit Platform'] },
  { name: 'Dumbbell Walking Lunge', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=eFWCn5iEbTU', category: 'compound', equipment: ['Dumbbells'] },
  { name: 'Machine Glute Kickback', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=NLDBFtSNhqg', category: 'isolation', equipment: ['Glute Kickback Machine'] },
  { name: 'Machine Hip Thrust', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=ZSPmIyX9RZs', category: 'compound', equipment: ['Hip Thrust Machine'] },
  { name: 'Reverse Lunge', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=TQfhY5oJ_Sc', category: 'compound', equipment: ['Bodyweight'] },
  { name: 'Single Leg Hip Thrust', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=lzDgRRuBdqY', category: 'compound', equipment: ['Bodyweight', 'Bench'] },
  { name: 'Split Squat', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=jNihW0WDIL4', category: 'compound', equipment: ['Bodyweight'] },
  { name: 'Sumo Deadlift', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=pfSMst14EFk', category: 'compound', equipment: ['Barbell'] },
  { name: 'Sumo Deficit Deadlift', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=bnYekgCKfv0', category: 'compound', equipment: ['Barbell', 'Deficit Platform'] },
  { name: 'Sumo Squat', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=4eDJa5MnAmY', category: 'compound', equipment: ['Barbell'] },
  { name: 'Trap Bar Deadlift', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=v709aJKv-gM', category: 'compound', equipment: ['Trap Bar'] },
  { name: 'DB Reverse Lunge', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=D-c2CWwEweo', category: 'compound', equipment: ['Dumbbells'] },
  { name: 'DB Split Squat', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=pjAewD4LxXs', category: 'compound', equipment: ['Dumbbells'] },
  { name: 'Single Leg DB Hip Thrust', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=CSXVj047Ss4', category: 'compound', equipment: ['Dumbbells', 'Bench'] },
  { name: 'Deadlift from 8 Inch Blocks', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=0Dq4XibjBWU', category: 'compound', equipment: ['Barbell', 'Blocks'] },
  { name: 'Deadlift from 12 Inch Blocks', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=Db5iv-hi1ik', category: 'compound', equipment: ['Barbell', 'Blocks'] },
  { name: 'Deadlift from 4 Inch Blocks', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=-cf8izxkSCM', category: 'compound', equipment: ['Barbell', 'Blocks'] },
  { name: 'Barbell Split Squat', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=VfsPxffCAd0', category: 'compound', equipment: ['Barbell'] },
  { name: 'Wide Stance Belt Squat', muscleGroup: 'Glutes', videoUrl: 'https://www.youtube.com/watch?v=LU2GYsqkgAQ', category: 'compound', equipment: ['Belt Squat Machine'] },

  // SHOULDERS (Front, Side, Rear Delts)
  { name: 'Cable Lateral Raise', muscleGroup: 'Side Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Dumbbell Lateral Raise', muscleGroup: 'Side Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Dumbbells'] },
  { name: 'Machine Lateral Raise', muscleGroup: 'Side Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Lateral Raise Machine'] },
  { name: 'Cable Front Raise', muscleGroup: 'Front Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Dumbbell Front Raise', muscleGroup: 'Front Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Dumbbells'] },
  { name: 'Barbell Overhead Press', muscleGroup: 'Front Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'compound', equipment: ['Barbell'] },
  { name: 'Dumbbell Overhead Press', muscleGroup: 'Front Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'compound', equipment: ['Dumbbells'] },
  { name: 'Cable Rear Delt Flye', muscleGroup: 'Rear Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Dumbbell Rear Delt Flye', muscleGroup: 'Rear Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Dumbbells'] },
  { name: 'Face Pull', muscleGroup: 'Rear Delts', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Cable Machine', 'Rope'] },

  // LEGS (Quads, Hamstrings, Calves)
  { name: 'Barbell Squat', muscleGroup: 'Quads', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'compound', equipment: ['Barbell'] },
  { name: 'Front Squat', muscleGroup: 'Quads', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'compound', equipment: ['Barbell'] },
  { name: 'Leg Press', muscleGroup: 'Quads', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'compound', equipment: ['Leg Press Machine'] },
  { name: 'Leg Extension', muscleGroup: 'Quads', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Leg Extension Machine'] },
  { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'compound', equipment: ['Barbell'] },
  { name: 'Leg Curl', muscleGroup: 'Hamstrings', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Leg Curl Machine'] },
  { name: 'Standing Calf Raise', muscleGroup: 'Calves', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Calf Raise Machine'] },
  { name: 'Seated Calf Raise', muscleGroup: 'Calves', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Seated Calf Machine'] },

  // ABS
  { name: 'Cable Crunch', muscleGroup: 'Abs', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Plank', muscleGroup: 'Abs', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'bodyweight', equipment: ['Bodyweight'] },
  { name: 'Russian Twist', muscleGroup: 'Abs', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'bodyweight', equipment: ['Bodyweight'] },
  { name: 'Hanging Leg Raise', muscleGroup: 'Abs', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'bodyweight', equipment: ['Pull-up Bar'] },

  // FOREARMS
  { name: 'Barbell Wrist Curl', muscleGroup: 'Forearms', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Barbell'] },
  { name: 'Reverse Barbell Wrist Curl', muscleGroup: 'Forearms', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Barbell'] },

  // TRAPS
  { name: 'Barbell Shrug', muscleGroup: 'Traps', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Barbell'] },
  { name: 'Dumbbell Shrug', muscleGroup: 'Traps', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Dumbbells'] },
  { name: 'Cable Shrug', muscleGroup: 'Traps', videoUrl: 'https://www.youtube.com/watch?v=example', category: 'isolation', equipment: ['Cable Machine'] },
]

// Helper functions
function getOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem('exerciseVideoOverrides')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function setCustomExerciseVideoUrl(exerciseName: string, url: string) {
  if (typeof window === 'undefined') return
  try {
    const overrides = getOverrides()
    overrides[exerciseName] = url
    window.localStorage.setItem('exerciseVideoOverrides', JSON.stringify(overrides))
  } catch {
    // ignore
  }
}

export function getExerciseVideoUrl(exerciseName: string): string | null {
  // 1) User override wins
  const overrides = getOverrides()
  if (overrides[exerciseName]) return overrides[exerciseName]

  // 2) Check database for exact match
  const exercise = EXERCISE_DATABASE.find(ex => 
    ex.name.toLowerCase() === exerciseName.toLowerCase()
  )
  if (exercise) return exercise.videoUrl

  // 3) Fallback to keyword matching
  const name = (exerciseName || '').toLowerCase()
  for (const exercise of EXERCISE_DATABASE) {
    if (exercise.name.toLowerCase().includes(name) || name.includes(exercise.name.toLowerCase())) {
      return exercise.videoUrl
    }
  }

  // 4) Fallback to default playlist
  return 'https://www.youtube.com/playlist?list=PLyqKj7LwU2RsCtKw3UlE85HYgPM3-xoO1'
}

export function toYouTubeEmbed(url: string): string {
  // Convert regular YouTube video URL to embed URL
  const videoMatch = url.match(/watch\?v=([a-zA-Z0-9_-]+)/)
  if (videoMatch) {
    return `https://www.youtube.com/embed/${videoMatch[1]}`
  }
  
  // Convert playlist page to embeddable playlist player
  const playlistMatch = url.match(/list=([a-zA-Z0-9_-]+)/)
  if (playlistMatch) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`
  }
  
  // If already an embed URL, return as is
  if (url.includes('youtube.com/embed')) {
    return url
  }
  
  // Default to given URL inside embed
  return url
}

// New functions for exercise management
export function getAllExercises(): ExerciseData[] {
  return EXERCISE_DATABASE
}

export function getExercisesByMuscleGroup(muscleGroup: string): ExerciseData[] {
  return EXERCISE_DATABASE.filter(ex => ex.muscleGroup === muscleGroup)
}

export function getExercisesByCategory(category: 'compound' | 'isolation' | 'cardio' | 'bodyweight'): ExerciseData[] {
  return EXERCISE_DATABASE.filter(ex => ex.category === category)
}

export function searchExercises(query: string): ExerciseData[] {
  const searchTerm = query.toLowerCase()
  return EXERCISE_DATABASE.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm) ||
    ex.muscleGroup.toLowerCase().includes(searchTerm) ||
    ex.equipment.some(eq => eq.toLowerCase().includes(searchTerm))
  )
}

export function getMuscleGroups(): string[] {
  return [...new Set(EXERCISE_DATABASE.map(ex => ex.muscleGroup))]
}

export function getEquipment(): string[] {
  const allEquipment = EXERCISE_DATABASE.flatMap(ex => ex.equipment)
  return [...new Set(allEquipment)]
}


