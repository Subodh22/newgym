'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

type HeatmapWorkout = {
	id: number
	workout_date: string | null
	is_completed: boolean
}

interface MesocycleHeatmapProps {
	workouts: HeatmapWorkout[]
	title?: string
}

function formatDateKey(date: Date): string {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

function getMonthGrid(reference: Date) {
	const startOfMonth = new Date(reference.getFullYear(), reference.getMonth(), 1)
	const endOfMonth = new Date(reference.getFullYear(), reference.getMonth() + 1, 0)

	// Start on Sunday of the first week shown
	const start = new Date(startOfMonth)
	start.setDate(start.getDate() - start.getDay())

	// End on Saturday of the last week shown
	const end = new Date(endOfMonth)
	end.setDate(end.getDate() + (6 - end.getDay()))

	const days: Date[] = []
	const cursor = new Date(start)
	while (cursor <= end) {
		days.push(new Date(cursor))
		cursor.setDate(cursor.getDate() + 1)
	}

	return { days, startOfMonth, endOfMonth }
}

export default function MesocycleHeatmap({ workouts, title = 'This Month' }: MesocycleHeatmapProps) {
	const reference = new Date()
	const { days, startOfMonth, endOfMonth } = getMonthGrid(reference)

	// Map dates to planned/completed intensities
	const byDate = new Map<string, { planned: number; completed: number }>()
	for (const w of workouts || []) {
		if (!w.workout_date) continue
		const key = w.workout_date.slice(0, 10)
		const current = byDate.get(key) || { planned: 0, completed: 0 }
		current.planned += 1
		if (w.is_completed) current.completed += 1
		byDate.set(key, current)
	}

	const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

	const getCellClasses = (date: Date) => {
		const key = formatDateKey(date)
		const stats = byDate.get(key)
		const isCurrentMonth = date.getMonth() === reference.getMonth()

		if (!stats) {
			return `${isCurrentMonth ? 'bg-gray-100' : 'bg-gray-50'} border border-gray-200`
		}

		// Intensity based on completion/planned
		if (stats.completed > 0) {
			// Stronger blue with more completed in the same day
			return `bg-blue-600/80 text-white border border-blue-700`
		}
		// Planned but not completed
		return `bg-blue-100 border border-blue-200 text-blue-700`
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-lg">Monthly Heatmap</CardTitle>
				<p className="text-xs text-gray-500">{title}</p>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{/* Weekday headers */}
					<div className="grid grid-cols-7 text-[10px] text-gray-500 px-1">
						{weekdayLabels.map((d) => (
							<div key={d} className="text-center">{d}</div>
						))}
					</div>

					{/* Calendar grid */}
					<div className="grid grid-cols-7 gap-1">
						{days.map((date) => {
							const isDim = date < startOfMonth || date > endOfMonth
							return (
								<div
									key={formatDateKey(date)}
									className={`relative h-8 rounded ${getCellClasses(date)} ${isDim ? 'opacity-60' : ''}`}
								>
									<span className="absolute top-0.5 left-1 text-[10px] text-gray-600">
										{date.getDate()}
									</span>
								</div>
							)
						})}
					</div>

					{/* Legend */}
					<div className="flex items-center gap-3 pt-1">
						<div className="flex items-center gap-1 text-[11px] text-gray-600">
							<div className="h-3 w-3 rounded bg-gray-100 border border-gray-200" />
							<span>No workout</span>
						</div>
						<div className="flex items-center gap-1 text-[11px] text-blue-700">
							<div className="h-3 w-3 rounded bg-blue-100 border border-blue-200" />
							<span>Planned</span>
						</div>
						<div className="flex items-center gap-1 text-[11px] text-blue-900">
							<div className="h-3 w-3 rounded bg-blue-600/80 border border-blue-700" />
							<span>Completed</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}


