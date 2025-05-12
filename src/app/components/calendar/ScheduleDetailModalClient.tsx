'use client';

import { ScheduleResponse } from "@/app/utile/interfaces/calendar/calendarModel";
import ScheduleDetailModal from "./ScheduleDetailModal";
import { useEffect, useState } from "react";
import { deleteSchedule, ScheduleById } from "@/app/utile/api/ScheduleApi";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ScheduleDetailModalClient() {
  const router = useRouter();
  const params = useParams();
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const idParam = params?.id;
    const id = typeof idParam === "string" ? parseInt(idParam) : Array.isArray(idParam) ? parseInt(idParam[0]) : NaN;
    if (!id || isNaN(id)) return;

    const fetchSchedule = async () => {
      try {
        const res = await ScheduleById(id);
        setSchedule(res);
      } catch (e) {
        console.error('일정 상세 조회 실패:', e);
      }
    };

    fetchSchedule();
  }, [params]);

  const handleDelete = async (id: number) => {
    try {
      await deleteSchedule(id);
      alert("삭제 완료");
      router.back(); // 모달 닫기
    } catch (err) {
      console.error("삭제 실패", err);
      alert("삭제 실패");
    }
  };

  const handleEdit = (schedule: ScheduleResponse) => {
    router.push(`/calendar/${schedule.id}/edit`);
  };

  const handleClose = () => {
    setOpen(false);
    router.back();
  };

  if (!open || !schedule) return null;

  return (
    <ScheduleDetailModal
      schedule={schedule}
      onClose={handleClose}
      onDelete={handleDelete}
      onEdit={handleEdit} />
  );
}