type CalendarEvent = {
  startDate: string;
  endDate: string;
  location?: string | null;
  title: string;
  allDay?: boolean;
  calendar: {
    isPrimary: boolean;
  };
};

type TransformedEvent = {
  time: string;
  name: string;
  lang: string;
  duration: string;
  isVisible: boolean;
};

const dummyNames = [
  'Carla Kenter',
  'Liam Moreno',
  'Sofia Turner',
  'Mateo Carter',
  'Isabella Cruz',
  'Ethan Vargas',
  'Lucia Martin',
  'Noah Delgado',
  'Camila Reyes',
  'James Rivera',
  'Valentina Ross',
  'Lucas Perry',
  'Mia Alvarez',
  'Oliver Torres',
  'Emma Castillo',
  'Benjamin Lopez',
  'Victoria Hall',
  'Sebastian Ward',
  'Chloe Ruiz',
  'Daniel Brooks',
  'Gabriela White',
  'Alexander Cruz',
  'Natalia Stone',
  'Michael Silva',
];

const getDuration = (start: string, end: string): string => {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  return `${Math.max(1, Math.round(diffHrs))}h`;
};

const getTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hrs = date.getUTCHours().toString().padStart(2, '0');
  return `${hrs}:00`;
};

export const transformCalendarData = (
  data: any[],
): TransformedEvent[] => {
  return data
    .filter(event => !event.allDay)
    .map((event, index) => ({
      time: getTime(event.startDate),
      name: dummyNames[index % dummyNames.length],
      lang:
        event.location && event.location.length > 0
          ? event.location
          : 'English - Spanish',
      duration: getDuration(event.startDate, event.endDate),
      isVisible: event.calendar?.isPrimary ?? false,
    }));
};
