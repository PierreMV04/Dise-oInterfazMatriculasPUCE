import { Course, DayOfWeek } from '../types/enrollment';
import { formatHour } from '../utils/enrollmentLogic';

interface WeeklyScheduleGridProps {
  courses: Course[];
}

const DAYS: DayOfWeek[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const COURSE_COLORS = [
  'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]',
  'bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D]',
  'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F1E36]',
  'bg-[#FFFBEB] border-[#FDE68A] text-[#78350F]',
  'bg-[#F5F3FF] border-[#DDD6FE] text-[#4C1D95]',
  'bg-[#ECFEFF] border-[#A5F3FC] text-[#164E63]',
];

export function WeeklyScheduleGrid({ courses }: WeeklyScheduleGridProps) {
  if (courses.length === 0) {
    return (
      <div className="border border-dashed border-[#CBD5E1] rounded-xl p-6 text-center text-sm text-[#64748B]">
        Aún no hay asignaturas seleccionadas para mostrar en el horario semanal.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#E2E6ED] rounded-xl bg-white">
      <table className="w-full min-w-[680px] border-collapse text-xs">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#E2E6ED]">
            <th className="w-20 py-2.5 px-3 text-left font-semibold text-[#475569] border-r border-[#E2E6ED]">
              Hora
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="py-2.5 px-2 text-center font-semibold text-[#0F1E36] border-r last:border-r-0 border-[#E2E6ED]"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((hour) => (
            <tr
              key={hour}
              className="border-b last:border-b-0 border-[#E2E6ED]"
            >
              <td className="py-2 px-3 font-mono text-[11px] text-[#64748B] tabular-nums border-r border-[#E2E6ED] bg-[#F8FAFC]/60">
                {formatHour(hour)}
              </td>
              {DAYS.map((day) => {
                const matchingCourses = courses
                  .map((course, idx) => ({
                    course,
                    colorClass: COURSE_COLORS[idx % COURSE_COLORS.length],
                    slot: course.schedule.find(
                      (s) => s.day === day && hour >= s.startHour && hour < s.endHour
                    ),
                  }))
                  .filter((item) => Boolean(item.slot));

                return (
                  <td
                    key={day}
                    className="p-1 align-top border-r last:border-r-0 border-[#E2E6ED] h-10"
                  >
                    {matchingCourses.length > 0 && (
                      <div className="space-y-1">
                        {matchingCourses.map(({ course, slot, colorClass }) => {
                          const isConflict = matchingCourses.length > 1;
                          return (
                            <div
                              key={`${course.id}-${day}-${hour}`}
                              className={`px-2 py-1 rounded border text-[11px] leading-tight ${
                                isConflict
                                  ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
                                  : colorClass
                              }`}
                            >
                              <div className="font-mono font-semibold truncate">
                                {course.code}
                                {isConflict ? ' (Cruce)' : ''}
                              </div>
                              <div className="truncate opacity-80">
                                {slot?.room}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
