import ClientHome from "./components/main";




export default function Home() {
  const sampleSchedules = [
    {
      id: 1,
      title: '회의',
      time: '10:00 ~ 11:30',
      category: '업무',
      status: 'IN_COMPLETE',
    },
    {
      id: 2,
      title: '공부',
      time: '14:00 ~ 15:00',
      category: 'MariaDB',
      status: 'COMPLETE',
    },
  ];

  return (<>
    <ClientHome initialSchedules={sampleSchedules}></ClientHome>
  </>);
}
