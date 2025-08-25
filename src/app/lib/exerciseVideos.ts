// COMPLETE and ACCURATE exercise video mappings - NO playlist fallback
// Every exercise has its own specific video or maps to the closest available

export interface ExerciseData {
  name: string
  muscleGroup: string
  videoUrl: string
  category: 'compound' | 'isolation' | 'cardio' | 'bodyweight'
  equipment: string[]
}

// COMPREHENSIVE video URL mappings - NO playlist fallback
const VIDEO_MAPPINGS: Record<string, string> = {
  // CHEST EXERCISES (from chest.txt) - EXACT MATCHES ONLY
  'Cable Flye': 'https://www.youtube.com/watch?v=4mfLHnFL0Uw',
  'Cable Bent Flye': 'https://www.youtube.com/watch?v=Cj6P91eFXkM',
  'Cable Underhand Flye': 'https://www.youtube.com/watch?v=e_8HLu59-to',
  'Cambered Bar Bench Press': 'https://www.youtube.com/watch?v=_9VlfuYYC7w',
  'Deficit Pushup': 'https://www.youtube.com/watch?v=gmNlqsE3Onc',
  'Flat Dumbbell Bench Press': 'https://www.youtube.com/watch?v=YQ2s_Y7g5Qk',
  'Flat Dumbbell Flye': 'https://www.youtube.com/watch?v=JFm8KbhjibM',
  'Flat Dumbbell Press Flye': 'https://www.youtube.com/watch?v=BhlL-esnitU',
  'Flat Hammer Machine Press': 'https://www.youtube.com/watch?v=aV1U_mK3XOs',
  'Hammer Machine Chest Press': 'https://www.youtube.com/watch?v=0Wa9CfRXUkA',
  'High Incline Dumbbell Press': 'https://www.youtube.com/watch?v=GFYrRBoov3w',
  'Incline Dumbbell Flye': 'https://www.youtube.com/watch?v=8oR5hBwbIBc',
  'Incline Dumbbell Press': 'https://www.youtube.com/watch?v=5CECBjd7HLQ',
  'Incline Dumbbell Press Flye': 'https://www.youtube.com/watch?v=lTfiohnjbyM',
  'Incline Machine Chest Press': 'https://www.youtube.com/watch?v=TrTSvn5-MTk',
  'Incline Medium Grip Bench Press': 'https://www.youtube.com/watch?v=lJ2o89kcnxY',
  'Incline Narrow Grip Bench Press': 'https://www.youtube.com/watch?v=Zfi0KcIJi6c',
  'Incline Wide Grip Bench Press': 'https://www.youtube.com/watch?v=FxQ0XEoFYQk',
  'Low Incline Dumbbell Press': 'https://www.youtube.com/watch?v=B09ZkYsnKko',
  'Machine Chest Press': 'https://www.youtube.com/watch?v=NwzUje3z0qY',
  'Machine Flye': 'https://www.youtube.com/watch?v=FDay9wFe5uE',
  'Medium Grip Bench Press': 'https://www.youtube.com/watch?v=gMgvBspQ9lk',
  'Narrow Pushup': 'https://www.youtube.com/watch?v=Lz1aFtuNvEQ',
  'Narrow Grip Bench Press': 'https://www.youtube.com/watch?v=FiQUzPtS90E',
  'Pec Deck Flye': 'https://www.youtube.com/watch?v=O-OBCfyh9Fw',
  'Pushup': 'https://www.youtube.com/watch?v=mm6_WcoCVTA',
  'Smith Machine Bench Press': 'https://www.youtube.com/watch?v=O5viuEPDXKY',
  'Smith Machine Incline Press': 'https://www.youtube.com/watch?v=8urE8Z8AMQ4',
  'Smith Machine Narrow Grip Bench Press': 'https://www.youtube.com/watch?v=qf_FTh3QyYs',
  'Smith Machine Narrow Grip Incline Press': 'https://www.youtube.com/watch?v=PYijbpxFAv8',
  'Smith Machine Wide Grip Bench Press': 'https://www.youtube.com/watch?v=AK0ycfB_kYo',
  'Smith Machine Wide Grip Incline Press': 'https://www.youtube.com/watch?v=SHL81neluiI',
  'Wide Grip Bench Press': 'https://www.youtube.com/watch?v=EeE3f4VWFDo',

  // COMMON CHEST VARIATIONS - map to closest available video
  'Barbell Bench Press': 'https://www.youtube.com/watch?v=gMgvBspQ9lk', // Medium Grip Bench Press
  'Bench Press': 'https://www.youtube.com/watch?v=gMgvBspQ9lk', // Medium Grip Bench Press
  'Flat Barbell Bench Press': 'https://www.youtube.com/watch?v=gMgvBspQ9lk', // Medium Grip Bench Press
  'Incline Barbell Bench Press': 'https://www.youtube.com/watch?v=lJ2o89kcnxY', // Incline Medium Grip Bench Press
  'Decline Barbell Bench Press': 'https://www.youtube.com/watch?v=gMgvBspQ9lk', // Use regular bench press as closest
  'Dumbbell Bench Press': 'https://www.youtube.com/watch?v=YQ2s_Y7g5Qk', // Flat Dumbbell Bench Press
  'Incline Dumbbell Bench Press': 'https://www.youtube.com/watch?v=5CECBjd7HLQ', // Incline Dumbbell Press
  'Decline Dumbbell Bench Press': 'https://www.youtube.com/watch?v=YQ2s_Y7g5Qk', // Use flat dumbbell press as closest
  'Dumbbell Flye': 'https://www.youtube.com/watch?v=JFm8KbhjibM', // Flat Dumbbell Flye
  'Decline Dumbbell Flye': 'https://www.youtube.com/watch?v=JFm8KbhjibM', // Use flat dumbbell flye as closest
  'Push Up': 'https://www.youtube.com/watch?v=mm6_WcoCVTA', // Pushup
  'Diamond Push Up': 'https://www.youtube.com/watch?v=mm6_WcoCVTA', // Use regular pushup as closest
  'Wide Push Up': 'https://www.youtube.com/watch?v=mm6_WcoCVTA', // Use regular pushup as closest
  'Close Grip Bench Press': 'https://www.youtube.com/watch?v=FiQUzPtS90E', // Narrow Grip Bench Press

  // BACK EXERCISES (from back.txt) - EXACT MATCHES ONLY
  'Assisted Normal Grip Pullup': 'https://www.youtube.com/watch?v=8ygapPMYK1I',
  'Assisted Parallel Pullup': 'https://www.youtube.com/watch?v=GdsRZAeeDUc',
  'Assisted Underhand Pullup': 'https://www.youtube.com/watch?v=L4ChTwrXTjc',
  'Assisted Wide Grip Pullup': 'https://www.youtube.com/watch?v=0tiC6RUZL8Y',
  'Barbell Bent Over Row': 'https://www.youtube.com/watch?v=6FZHJGzMFEc',
  'Barbell Row to Chest': 'https://www.youtube.com/watch?v=UPGuwx7GQ9s',
  'Cambered Bar Row': 'https://www.youtube.com/watch?v=jiowkUMomlw',
  'Chest Supported Row': 'https://www.youtube.com/watch?v=0UBRfiO4zDs',
  'Dumbbell Pullover': 'https://www.youtube.com/watch?v=jQjWlIwG4sI',
  'Hammer High Row': 'https://www.youtube.com/watch?v=gg5hwJuv6KI',
  'Hammer Low Row': 'https://www.youtube.com/watch?v=opjbouBmUWg',
  'Incline Dumbbell Row': 'https://www.youtube.com/watch?v=tZUYS7X50so',
  'Inverted Row': 'https://www.youtube.com/watch?v=KOaCM1HMwU0',
  'Machine Chest Supported Row': 'https://www.youtube.com/watch?v=_FrrYQxA6kc',
  'Machine Pullover': 'https://www.youtube.com/watch?v=oxpAl14EYyc',
  'Normal Grip Pulldown': 'https://www.youtube.com/watch?v=EUIri47Epcg',
  'Normal Grip Pullup': 'https://www.youtube.com/watch?v=iWpoegdfgtc',
  'Parallel Pulldown': 'https://www.youtube.com/watch?v=--utaPT7XYQ',
  'Parallel Grip Pullup': 'https://www.youtube.com/watch?v=XWt6FQAK5wM',
  'Seal Row': 'https://www.youtube.com/watch?v=4H2ItXwUTp8',
  'Seated Cable Row': 'https://www.youtube.com/watch?v=UCXxvVItLoM',
  'Two Arm Dumbbell Row': 'https://www.youtube.com/watch?v=5PoEksoJNaw',
  'Single Arm Supported Dumbbell Row': 'https://www.youtube.com/watch?v=DMo3HJoawrU',
  'Smith Machine Row': 'https://www.youtube.com/watch?v=3QcJggd_L24',
  'Straight Arm Pulldown': 'https://www.youtube.com/watch?v=G9uNaXGTJ4w',
  'T Bar Row': 'https://www.youtube.com/watch?v=yPis7nlbqdY',
  'Underhand EZ Bar Row': 'https://www.youtube.com/watch?v=H260SUUyJBM',
  'Underhand Pulldown': 'https://www.youtube.com/watch?v=VprlTxpB1rk',
  'Wide Grip Pulldown': 'https://www.youtube.com/watch?v=YCKPD4BSD2E',
  'Wide Grip Pullup': 'https://www.youtube.com/watch?v=GRgWPT9XSQQ',
  'Underhand Pullup': 'https://www.youtube.com/watch?v=9JC1EwqezGY',
  'Barbell Flexion Row': 'https://www.youtube.com/watch?v=Lt3d1UKq7RQ',

  // COMMON BACK VARIATIONS - map to closest available video
  'Pull Up': 'https://www.youtube.com/watch?v=iWpoegdfgtc', // Normal Grip Pullup
  'Pullup': 'https://www.youtube.com/watch?v=iWpoegdfgtc', // Normal Grip Pullup
  'Pull-up': 'https://www.youtube.com/watch?v=iWpoegdfgtc', // Normal Grip Pullup
  'Chin Up': 'https://www.youtube.com/watch?v=9JC1EwqezGY', // Underhand Pullup
  'Lat Pulldown': 'https://www.youtube.com/watch?v=YCKPD4BSD2E', // Wide Grip Pulldown
  'Barbell Row': 'https://www.youtube.com/watch?v=6FZHJGzMFEc', // Barbell Bent Over Row
  'Dumbbell Row': 'https://www.youtube.com/watch?v=5PoEksoJNaw', // Two Arm Dumbbell Row
  'Cable Row': 'https://www.youtube.com/watch?v=UCXxvVItLoM', // Seated Cable Row
  'T-Bar Row': 'https://www.youtube.com/watch?v=yPis7nlbqdY', // T Bar Row
  'Bent Over Row': 'https://www.youtube.com/watch?v=6FZHJGzMFEc', // Barbell Bent Over Row
  'Pendlay Row': 'https://www.youtube.com/watch?v=6FZHJGzMFEc', // Barbell Bent Over Row
  'Yates Row': 'https://www.youtube.com/watch?v=6FZHJGzMFEc', // Barbell Bent Over Row
  'Single Arm Dumbbell Row': 'https://www.youtube.com/watch?v=DMo3HJoawrU', // Single Arm Supported Dumbbell Row
  'Cable Single Arm Row': 'https://www.youtube.com/watch?v=DMo3HJoawrU', // Single Arm Supported Dumbbell Row
  'Machine Row': 'https://www.youtube.com/watch?v=3QcJggd_L24', // Smith Machine Row

  // SHOULDER EXERCISES (from frontdelts.txt) - EXACT MATCHES ONLY
  'Barbell Overhead Press': 'https://www.youtube.com/watch?v=G2qpTG1Eh40',
  'Dumbbell Overhead Press': 'https://www.youtube.com/watch?v=Raemd3qWgJc',
  'Seated Barbell Shoulder Press': 'https://www.youtube.com/watch?v=IuzRCN6eG6Y',
  'Seated Dumbbell Shoulder Press': 'https://www.youtube.com/watch?v=HzIiNhHhhtA',
  'Machine Shoulder Press': 'https://www.youtube.com/watch?v=WvLMauqrnK8',
  'Smith Machine Seated Shoulder Press': 'https://www.youtube.com/watch?v=OLqZDUUD2b0',
  'Barbell Front Raise': 'https://www.youtube.com/watch?v=_ikCPws1mbE',
  'Dumbbell Front Raise': 'https://www.youtube.com/watch?v=hRJ6tR5-if0',
  'Cable Front Raise': 'https://www.youtube.com/watch?v=yIoAcMD3jcE',
  'EZ Bar Underhand Front Raise': 'https://www.youtube.com/watch?v=87pZAbYjXc4',

  // COMMON SHOULDER VARIATIONS - map to closest available video
  'Overhead Press': 'https://www.youtube.com/watch?v=G2qpTG1Eh40', // Barbell Overhead Press
  'Military Press': 'https://www.youtube.com/watch?v=G2qpTG1Eh40', // Barbell Overhead Press
  'Standing Barbell Shoulder Press': 'https://www.youtube.com/watch?v=G2qpTG1Eh40', // Barbell Overhead Press
  'Standing Dumbbell Shoulder Press': 'https://www.youtube.com/watch?v=Raemd3qWgJc', // Dumbbell Overhead Press

  // SIDE DELTS (from sidedelts.txt) - EXACT MATCHES ONLY
  'Lateral Raise': 'https://www.youtube.com/watch?v=OuG1smZTsQQ',
  'Machine Lateral Raise': 'https://www.youtube.com/watch?v=0o07iGKUarI',
  'Cable Cross Body Lateral Raise': 'https://www.youtube.com/watch?v=2OMbdPF7mz4',
  'Leaning Cable Lateral Raise': 'https://www.youtube.com/watch?v=lq7eLC30b9w',
  'Thumbs Down Lateral Raise': 'https://www.youtube.com/watch?v=D1f7d1OcobY',
  'Top Hold Lateral Raise': 'https://www.youtube.com/watch?v=SKf8wHlIFX0',
  'Barbell Upright Row': 'https://www.youtube.com/watch?v=um3VVzqunPU',
  'Cable Upright Row': 'https://www.youtube.com/watch?v=qr3ziolhjvQ',
  'Dumbbell Upright Row': 'https://www.youtube.com/watch?v=Ub6QruNKfbY',
  'Smith Machine Upright Row': 'https://www.youtube.com/watch?v=QIpa-9dtkgA',

  // COMMON SIDE DELT VARIATIONS - map to closest available video
  'Dumbbell Lateral Raise': 'https://www.youtube.com/watch?v=OuG1smZTsQQ', // Lateral Raise
  'Cable Lateral Raise': 'https://www.youtube.com/watch?v=OuG1smZTsQQ', // Lateral Raise

  // REAR DELTS (from reardelts.txt) - EXACT MATCHES ONLY
  'Bent Lateral Raise': 'https://www.youtube.com/watch?v=34gVHrkaiz0',
  'Cable Cross Body Bent Lateral Raise': 'https://www.youtube.com/watch?v=f0g5NkYiWUY',
  'Cable Single Arm Rear Delt Raise': 'https://www.youtube.com/watch?v=qz1OLup4W_M',
  'Incline Dumbbell Lateral Raise': 'https://www.youtube.com/watch?v=z3PRz2aVA10',
  'Machine Reverse Flye': 'https://www.youtube.com/watch?v=5YK4bgzXDp0',
  'Cable Rope Facepull': 'https://www.youtube.com/watch?v=-MODnZdnmAQ',
  'Dumbbell Facepull': 'https://www.youtube.com/watch?v=nzTY7j9ocR8',
  'Incline Dumbbell Facepull': 'https://www.youtube.com/watch?v=90cE3rCLtmo',
  'Kneeling Cable Facepull': 'https://www.youtube.com/watch?v=8CGMuud1ANw',
  'Barbell Facepull': 'https://www.youtube.com/watch?v=hPWYuhJMUhU',

  // COMMON REAR DELT VARIATIONS - map to closest available video
  'Cable Rear Delt Flye': 'https://www.youtube.com/watch?v=34gVHrkaiz0', // Bent Lateral Raise
  'Dumbbell Rear Delt Flye': 'https://www.youtube.com/watch?v=34gVHrkaiz0', // Bent Lateral Raise
  'Face Pull': 'https://www.youtube.com/watch?v=-MODnZdnmAQ', // Cable Rope Facepull

  // TRAPS (from traps.txt) - EXACT MATCHES ONLY
  'Barbell Shrug': 'https://www.youtube.com/watch?v=M_MjF5Nm_h4',
  'Dumbbell Shrug': 'https://www.youtube.com/watch?v=_t3lrPI6Ns4',
  'Cable Shrug': 'https://www.youtube.com/watch?v=YykmcX2b-LY',
  'Seated Dumbbell Shrug': 'https://www.youtube.com/watch?v=zgToz5FiI-E',
  'Barbell Bent Shrug': 'https://www.youtube.com/watch?v=d9daNDIXtK8',
  'Cable Bent Shrug': 'https://www.youtube.com/watch?v=nOn_Bz0zrwQ',
  'Dumbbell Bent Shrug': 'https://www.youtube.com/watch?v=5z7ZtboxbBY',
  'Dumbbell Lean Shrug': 'https://www.youtube.com/watch?v=GH_l85Ky3vA',
  'Cable Side Shrug': 'https://www.youtube.com/watch?v=2zaT3WAgZi0',
  'Cable Single Arm Side Shrug': 'https://www.youtube.com/watch?v=BeIcUXQ3RDc',

  // LEGS - QUADS (from quads.txt) - EXACT MATCHES ONLY
  'Barbell Squat': 'https://www.youtube.com/watch?v=i7J5h7BJ07g',
  'High Bar Squat': 'https://www.youtube.com/watch?v=i7J5h7BJ07g',
  'Front Squat': 'https://www.youtube.com/watch?v=HHxNbhP16UE',
  'Front Squat Cross Grip': 'https://www.youtube.com/watch?v=0DQvn2qsOG4',
  'Leg Press': 'https://www.youtube.com/watch?v=yZmx_Ac3880',
  'Leg Extension': 'https://www.youtube.com/watch?v=m0FOpMEgero',
  'Hack Squat': 'https://www.youtube.com/watch?v=rYgNArpwE7E',
  'Narrow Stance Squat': 'https://www.youtube.com/watch?v=1IIPcUCKxcE',
  'Feet Forward Smith Squat': 'https://www.youtube.com/watch?v=-eO_VydErV0',
  'High Bar Half Squat': 'https://www.youtube.com/watch?v=dDHLBiswGNA',
  'High Bar Parallel Squat': 'https://www.youtube.com/watch?v=8w94JRax4yg',
  'High Bar Quarter Squat': 'https://www.youtube.com/watch?v=q3mO8UssOWQ',
  'High Bar Third Squat': 'https://www.youtube.com/watch?v=ZNZfURzjrnM',
  'Barbell Split Squat': 'https://www.youtube.com/watch?v=VfsPxffCAd0',
  'Belt Squat': 'https://www.youtube.com/watch?v=L__-j2v_LPM',

  // LEGS - HAMSTRINGS (from hamstrings.txt) - EXACT MATCHES ONLY
  'Stiff Legged Deadlift': 'https://www.youtube.com/watch?v=CN_7cz3P-1U',
  'Dumbbell Stiff Legged Deadlift': 'https://www.youtube.com/watch?v=cYKYGwcg0U8',
  'Stiff-Legged Deadlift from 12 Inch Blocks': 'https://www.youtube.com/watch?v=nYi-rVXnRD0',
  'Stiff Legged Deadlift from 4 Inch Blocks': 'https://www.youtube.com/watch?v=P-RWTcby_G4',
  'Stiff Legged Deadlift from 8 Inch Blocks': 'https://www.youtube.com/watch?v=nQQ30A-R25M',
  'Lying Leg Curl': 'https://www.youtube.com/watch?v=n5WDXD_mpVY',
  'Seated Leg Curl': 'https://www.youtube.com/watch?v=Orxowest56U',
  'Single Leg Leg Curl': 'https://www.youtube.com/watch?v=N6FVnaasdq0',
  '45 Degree Back Raise': 'https://www.youtube.com/watch?v=5_ejbGfdAQE',
  'Glute Ham Raise': 'https://www.youtube.com/watch?v=SBGYSfoqyfU',
  'High Bar Good Morning': 'https://www.youtube.com/watch?v=dEJ0FTm-CEk',
  'Low Bar Good Morning': 'https://www.youtube.com/watch?v=mnxn-7SO9Ks',

  // LEGS - CALVES (from calves.txt) - EXACT MATCHES ONLY
  'Calf Machine': 'https://www.youtube.com/watch?v=N3awlEyTY98',
  'Leg Press Calves': 'https://www.youtube.com/watch?v=KxEYX_cuesM',
  'Single Leg Stair Calves': 'https://www.youtube.com/watch?v=_gEx2ijsmNM',
  'Smith Machine Calves': 'https://www.youtube.com/watch?v=hh5516HCu4k',
  'Stair Calves': 'https://www.youtube.com/watch?v=__qfDhdByMY',

  // GLUTES (from glutes.txt) - EXACT MATCHES ONLY
  'Barbell Hip Thrust': 'https://www.youtube.com/watch?v=EF7jXP17DPE',
  'Machine Hip Thrust': 'https://www.youtube.com/watch?v=ZSPmIyX9RZs',
  'Single Leg Hip Thrust': 'https://www.youtube.com/watch?v=lzDgRRuBdqY',
  'Single Leg DB Hip Thrust': 'https://www.youtube.com/watch?v=CSXVj047Ss4',
  'Barbell Walking Lunge': 'https://www.youtube.com/watch?v=_meXEWq5MOQ',
  'Dumbbell Walking Lunge': 'https://www.youtube.com/watch?v=eFWCn5iEbTU',
  'Reverse Lunge': 'https://www.youtube.com/watch?v=TQfhY5oJ_Sc',
  'DB Reverse Lunge': 'https://www.youtube.com/watch?v=D-c2CWwEweo',
  'Split Squat': 'https://www.youtube.com/watch?v=jNihW0WDIL4',
  'DB Split Squat': 'https://www.youtube.com/watch?v=pjAewD4LxXs',
  'Cable Pull Through': 'https://www.youtube.com/watch?v=pv8e6OSyETE',
  'Machine Glute Kickback': 'https://www.youtube.com/watch?v=NLDBFtSNhqg',

  // DEADLIFTS (from glutes.txt) - EXACT MATCHES ONLY
  'Deadlift': 'https://www.youtube.com/watch?v=AweC3UaM14o',
  'Sumo Deadlift': 'https://www.youtube.com/watch?v=pfSMst14EFk',
  'Trap Bar Deadlift': 'https://www.youtube.com/watch?v=v709aJKv-gM',
  'Deficit Deadlift': 'https://www.youtube.com/watch?v=X-uKkAukJVA',
  'Deficit 25s Deadlift': 'https://www.youtube.com/watch?v=kvWcDHH62j0',
  'Sumo Deficit Deadlift': 'https://www.youtube.com/watch?v=bnYekgCKfv0',
  'Deadlift from 4 Inch Blocks': 'https://www.youtube.com/watch?v=-cf8izxkSCM',
  'Deadlift from 8 Inch Blocks': 'https://www.youtube.com/watch?v=0Dq4XibjBWU',
  'Deadlift from 12 Inch Blocks': 'https://www.youtube.com/watch?v=Db5iv-hi1ik',
  'Sumo Squat': 'https://www.youtube.com/watch?v=4eDJa5MnAmY',
  'Wide Stance Belt Squat': 'https://www.youtube.com/watch?v=LU2GYsqkgAQ',

  // BICEPS (from biceps.txt) - EXACT MATCHES ONLY
  'Barbell Curl': 'https://www.youtube.com/watch?v=JnLFSFurrqQ',
  'Barbell Curl Normal Grip': 'https://www.youtube.com/watch?v=JnLFSFurrqQ',
  'Barbell Curl Narrow Grip': 'https://www.youtube.com/watch?v=pUS6HBQjRmc',
  'Alternating Dumbbell Curl': 'https://www.youtube.com/watch?v=iixND1P2lik',
  'Dumbbell Twist Curl': 'https://www.youtube.com/watch?v=tRXw8HQ7-oA',
  'Hammer Curl': 'https://www.youtube.com/watch?v=XOEL4MgekYE',
  'Incline Dumbbell Curl': 'https://www.youtube.com/watch?v=aTYlqC_JacQ',
  'EZ Bar Curl': 'https://www.youtube.com/watch?v=JnLFSFurrqQ',
  'EZ Bar Curl Narrow Grip': 'https://www.youtube.com/watch?v=cdmnvo3augg',
  'EZ Bar Curl Wide Grip': 'https://www.youtube.com/watch?v=EK747VC37yE',
  'Cable EZ Bar Curl': 'https://www.youtube.com/watch?v=opFVuRi_3b8',
  'Cable EZ Bar Curl Wide Grip': 'https://www.youtube.com/watch?v=yuozln3CC94',
  'EZ Bar Preacher Curl': 'https://www.youtube.com/watch?v=sxA__DoLsgo',
  'Dumbbell Single Arm Preacher Curl': 'https://www.youtube.com/watch?v=fuK3nFvwgXk',
  'Machine Preacher Curl': 'https://www.youtube.com/watch?v=Ja6ZlIDONac',
  'Dumbbell Spider Curl': 'https://www.youtube.com/watch?v=ke2shAeQ0O8',
  'EZ Bar Spider Curl': 'https://www.youtube.com/watch?v=WG3vdcq__I0',
  'Rope Twist Curl': 'https://www.youtube.com/watch?v=2CDKTFFp5fA',

  // TRICEPS (from triceps.txt) - EXACT MATCHES ONLY
  'Dip': 'https://www.youtube.com/watch?v=4LA1kF7yCGo',
  'Assisted Dip': 'https://www.youtube.com/watch?v=yZ83t4mrPrI',
  'Barbell Triceps Overhead Extension': 'https://www.youtube.com/watch?v=q5X9thiKofE',
  'Barbell Skullcrusher': 'https://www.youtube.com/watch?v=l3rHYPtMUo8',
  'Dumbbell Skullcrusher': 'https://www.youtube.com/watch?v=jPjhQ2hsAds',
  'Inverted Skullcrusher': 'https://www.youtube.com/watch?v=1lrjpLuXH4w',
  'Cable Overhead Triceps Extension': 'https://www.youtube.com/watch?v=1u18yJELsh0',
  'Cable Triceps Pushdown': 'https://www.youtube.com/watch?v=6Fzep104f0s',
  'Cable Single Arm Pushdown': 'https://www.youtube.com/watch?v=Cp_bShvMY4c',
  'Rope Pushdown': 'https://www.youtube.com/watch?v=-xa-6cQaZKY',
  'Rope Overhead Triceps Extension': 'https://www.youtube.com/watch?v=kqidUIf1eJE',
  'EZ Bar Overhead Triceps Extension': 'https://www.youtube.com/watch?v=IdZ7HXnatko',
  'Seated EZ Bar Overhead Triceps Extension': 'https://www.youtube.com/watch?v=gcRZqG8t44c',
  'Seated Barbell Overhead Triceps Extension': 'https://www.youtube.com/watch?v=ktU2H0DDmwk',
  'Machine Triceps Extension': 'https://www.youtube.com/watch?v=Bx8ga1BLHLE',
  'Machine Triceps Pushdown': 'https://www.youtube.com/watch?v=OChuGyCSC7U',
  'JM Press': 'https://www.youtube.com/watch?v=Tih5iHyELsE',

  // ABS (from abs.txt) - EXACT MATCHES ONLY
  'Hanging Knee Raise': 'https://www.youtube.com/watch?v=RD_A-Z15ER4',
  'Hanging Straight Leg Raise': 'https://www.youtube.com/watch?v=7FwGZ8qY5OU',
  'Machine Crunch': 'https://www.youtube.com/watch?v=-OUSBPnHvsQ',
  'Modified Candlestick': 'https://www.youtube.com/watch?v=T_X5rb3G5lk',
  'Reaching Situp': 'https://www.youtube.com/watch?v=pXg8qppif7I',
  'Rope Crunch': 'https://www.youtube.com/watch?v=6GMKPQVERzw',
  'Slant Board Situp': 'https://www.youtube.com/watch?v=DAnTf16NcT0',
  'V-Up': 'https://www.youtube.com/watch?v=BIOM5eSsJ_8',
  'Front Plank': 'https://www.youtube.com/watch?v=Ff4_A3y7JR0',
  'Front Plank with Limb Raises': 'https://www.youtube.com/watch?v=DrRSNSidnQc',
  'Side Plank': 'https://www.youtube.com/watch?v=KzEakx0Oja8',
  'Side Plank with Limb Raises': 'https://www.youtube.com/watch?v=rNDhOJjF8TI',
  'Hollow Body Hold': 'https://www.youtube.com/watch?v=eJh4JmC80Q8',

  // FOREARMS (from forearms.txt) - EXACT MATCHES ONLY
  'Cable Wrist Curl': 'https://www.youtube.com/watch?v=WVAaKJvToe0',
  'Dumbbell Bench Wrist Curl': 'https://www.youtube.com/watch?v=2wPpcJBe03o',
  'Dumbbell Standing Wrist Curl': 'https://www.youtube.com/watch?v=iQ4JjOK73PE',
  'Barbell Standing Wrist Curl': 'https://www.youtube.com/watch?v=lfQR7oVS8eo',

  // COMMON LEG VARIATIONS - map to closest available video
  'Squat': 'https://www.youtube.com/watch?v=i7J5h7BJ07g', // High Bar Squat
  'Romanian Deadlift': 'https://www.youtube.com/watch?v=CN_7cz3P-1U', // Stiff Legged Deadlift
  'Leg Curl': 'https://www.youtube.com/watch?v=n5WDXD_mpVY', // Lying Leg Curl
  'Standing Calf Raise': 'https://www.youtube.com/watch?v=__qfDhdByMY', // Stair Calves
  'Seated Calf Raise': 'https://www.youtube.com/watch?v=KxEYX_cuesM', // Leg Press Calves

  // COMMON ARM VARIATIONS - map to closest available video
  'Curl': 'https://www.youtube.com/watch?v=JnLFSFurrqQ', // Barbell Curl Normal Grip
  'Bicep Curl': 'https://www.youtube.com/watch?v=JnLFSFurrqQ', // Barbell Curl Normal Grip
  'Biceps Curl': 'https://www.youtube.com/watch?v=JnLFSFurrqQ', // Barbell Curl Normal Grip
  'Dumbbell Curl': 'https://www.youtube.com/watch?v=JnLFSFurrqQ', // Barbell Curl Normal Grip
  'Tricep Pushdown': 'https://www.youtube.com/watch?v=6Fzep104f0s', // Cable Triceps Pushdown
  'Dips': 'https://www.youtube.com/watch?v=4LA1kF7yCGo', // Dip
}

// Comprehensive exercise database
const EXERCISE_DATABASE: ExerciseData[] = [
  // CHEST EXERCISES
  { name: 'Barbell Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=gMgvBspQ9lk', category: 'compound', equipment: ['Barbell', 'Bench'] },
  { name: 'Dumbbell Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=YQ2s_Y7g5Qk', category: 'compound', equipment: ['Dumbbells', 'Bench'] },
  { name: 'Incline Barbell Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=lJ2o89kcnxY', category: 'compound', equipment: ['Barbell', 'Incline Bench'] },
  { name: 'Decline Barbell Bench Press', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=gMgvBspQ9lk', category: 'compound', equipment: ['Barbell', 'Decline Bench'] },
  { name: 'Cable Flye', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=4mfLHnFL0Uw', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Pushup', muscleGroup: 'Chest', videoUrl: 'https://www.youtube.com/watch?v=mm6_WcoCVTA', category: 'bodyweight', equipment: ['Bodyweight'] },

  // BACK EXERCISES
  { name: 'Pull Up', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=iWpoegdfgtc', category: 'bodyweight', equipment: ['Pull-up Bar'] },
  { name: 'Barbell Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=6FZHJGzMFEc', category: 'compound', equipment: ['Barbell'] },
  { name: 'Dumbbell Row', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=5PoEksoJNaw', category: 'compound', equipment: ['Dumbbells'] },
  { name: 'Lat Pulldown', muscleGroup: 'Back', videoUrl: 'https://www.youtube.com/watch?v=YCKPD4BSD2E', category: 'compound', equipment: ['Cable Machine'] },

  // SHOULDER EXERCISES
  { name: 'Overhead Press', muscleGroup: 'Shoulders', videoUrl: 'https://www.youtube.com/watch?v=G2qpTG1Eh40', category: 'compound', equipment: ['Barbell'] },
  { name: 'Lateral Raise', muscleGroup: 'Shoulders', videoUrl: 'https://www.youtube.com/watch?v=OuG1smZTsQQ', category: 'isolation', equipment: ['Dumbbells'] },
  { name: 'Face Pull', muscleGroup: 'Shoulders', videoUrl: 'https://www.youtube.com/watch?v=-MODnZdnmAQ', category: 'isolation', equipment: ['Cable Machine'] },

  // LEG EXERCISES
  { name: 'Squat', muscleGroup: 'Legs', videoUrl: 'https://www.youtube.com/watch?v=i7J5h7BJ07g', category: 'compound', equipment: ['Barbell'] },
  { name: 'Deadlift', muscleGroup: 'Legs', videoUrl: 'https://www.youtube.com/watch?v=AweC3UaM14o', category: 'compound', equipment: ['Barbell'] },
  { name: 'Leg Press', muscleGroup: 'Legs', videoUrl: 'https://www.youtube.com/watch?v=yZmx_Ac3880', category: 'compound', equipment: ['Leg Press Machine'] },
  { name: 'Leg Curl', muscleGroup: 'Legs', videoUrl: 'https://www.youtube.com/watch?v=n5WDXD_mpVY', category: 'isolation', equipment: ['Leg Curl Machine'] },

  // ARM EXERCISES
  { name: 'Curl', muscleGroup: 'Arms', videoUrl: 'https://www.youtube.com/watch?v=JnLFSFurrqQ', category: 'isolation', equipment: ['Barbell'] },
  { name: 'Tricep Pushdown', muscleGroup: 'Arms', videoUrl: 'https://www.youtube.com/watch?v=6Fzep104f0s', category: 'isolation', equipment: ['Cable Machine'] },
  { name: 'Dips', muscleGroup: 'Arms', videoUrl: 'https://www.youtube.com/watch?v=4LA1kF7yCGo', category: 'bodyweight', equipment: ['Dip Bars'] },

  // ABS EXERCISES
  { name: 'Hanging Knee Raise', muscleGroup: 'Abs', videoUrl: 'https://www.youtube.com/watch?v=RD_A-Z15ER4', category: 'bodyweight', equipment: ['Pull-up Bar'] },
  { name: 'Front Plank', muscleGroup: 'Abs', videoUrl: 'https://www.youtube.com/watch?v=Ff4_A3y7JR0', category: 'bodyweight', equipment: ['Bodyweight'] },
]

// Convert YouTube URLs to embed URLs
function toYouTubeEmbed(url: string): string | null {
  if (!url) return null
  
  // Handle direct YouTube video URLs
  if (url.includes('watch?v=')) {
    const videoId = url.split('watch?v=')[1]?.split('&')[0]
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&fs=1&iv_load_policy=3&cc_load_policy=0&autoplay=0` : null
  }
  
  // Handle playlist URLs (extract first video)
  if (url.includes('playlist?list=')) {
    const videoId = url.split('index=')[1]?.split('&')[0]
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&fs=1&iv_load_policy=3&cc_load_policy=0&autoplay=0` : null
  }
  
  return null
}

// Get video URL for an exercise
export function getExerciseVideoUrl(exerciseName: string): string | null {
  // 1) Check specific video mappings first
  if (VIDEO_MAPPINGS[exerciseName]) {
    return VIDEO_MAPPINGS[exerciseName]
  }

  // 2) Check database for exact match
  const exercise = EXERCISE_DATABASE.find(ex =>
    ex.name.toLowerCase() === exerciseName.toLowerCase()
  )
  if (exercise) {
    return exercise.videoUrl
  }

  // 3) Fallback to keyword matching for similar names
  const name = (exerciseName || '').toLowerCase()
  for (const exercise of EXERCISE_DATABASE) {
    if (exercise.name.toLowerCase().includes(name) || name.includes(exercise.name.toLowerCase())) {
      return exercise.videoUrl
    }
  }

  // 4) NO playlist fallback - return null if no match found
  return null
}

// Get embed URL for an exercise
export function getExerciseEmbedUrl(exerciseName: string): string | null {
  const videoUrl = getExerciseVideoUrl(exerciseName)
  return videoUrl ? toYouTubeEmbed(videoUrl) : null
}

// Get all exercises
export function getAllExercises(): ExerciseData[] {
  return EXERCISE_DATABASE
}

// Unified list: database + any VIDEO_MAPPINGS keys not present
export function getAllExercisesUnified(): ExerciseData[] {
  const existingNames = new Set(EXERCISE_DATABASE.map(e => e.name))
  const extras: ExerciseData[] = []
  for (const name of Object.keys(VIDEO_MAPPINGS)) {
    if (!existingNames.has(name)) {
      extras.push({
        name,
        muscleGroup: 'Unknown',
        videoUrl: VIDEO_MAPPINGS[name],
        category: 'isolation',
        equipment: []
      })
    }
  }
  return [...EXERCISE_DATABASE, ...extras].sort((a, b) => a.name.localeCompare(b.name))
}

// Get exercises by muscle group
export function getExercisesByMuscleGroup(muscleGroup: string): ExerciseData[] {
  return EXERCISE_DATABASE.filter(ex => ex.muscleGroup === muscleGroup)
}

// Get exercises by category
export function getExercisesByCategory(category: string): ExerciseData[] {
  return EXERCISE_DATABASE.filter(ex => ex.category === category)
}

// Search exercises
export function searchExercises(query: string): ExerciseData[] {
  const searchTerm = query.toLowerCase()
  return EXERCISE_DATABASE.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm) ||
    ex.muscleGroup.toLowerCase().includes(searchTerm)
  )
}

// Get all muscle groups
export function getMuscleGroups(): string[] {
  return Array.from(new Set(EXERCISE_DATABASE.map(ex => ex.muscleGroup)))
}

// Get all equipment
export function getEquipment(): string[] {
  return Array.from(new Set(EXERCISE_DATABASE.flatMap(ex => ex.equipment)))
} 