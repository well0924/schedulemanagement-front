'use client';

import { getPresignedDownloadUrl } from "@/app/utile/api/AttachApi";
import { ScheduleResponse } from "@/app/utile/interfaces/calendar/calendarModel";
import Image from "next/image";

interface Props {
  schedule: ScheduleResponse;
  onClose: () => void;
  onDelete: (id: number) => void;
  onEdit: (schedule: ScheduleResponse) => void;
}

export default function ScheduleDetailModal({ schedule, onClose,onDelete,onEdit }: Props) {
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✖
        </button>

        <h2 className="text-2xl font-semibold mb-2">{schedule.contents}</h2>

        <div className="mb-2 text-sm text-gray-700 space-y-1">
          <p><strong>진행 상태:</strong> {schedule.progressStatus.value === 'COMPLETE' ? '✅ 완료' : '⏳ 미완료'}</p>
          <p><strong>시작:</strong> {formatDateTime(schedule.startTime)}</p>
          <p><strong>종료:</strong> {formatDateTime(schedule.endTime)}</p>
          <p><strong>반복:</strong> {schedule.repeatType !== 'NONE' ? `${schedule.repeatType} x${schedule.repeatCount}` : '없음'}</p>
          <p><strong>카테고리 ID:</strong> {schedule.categoryId}</p>
        </div>

        {schedule.attachFiles?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-1">📎 첨부파일</h3>
            {schedule.attachFiles?.length > 0 ? (
              <ul className="space-y-2">
                {schedule.attachFiles.map(file => (
                  <li key={file.id} className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const url = await getPresignedDownloadUrl(file.id);
                          window.open(url, "_blank");
                          // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (err: unknown) {
                          alert("다운로드 실패");
                        }
                      }}
                      className="text-blue-600 underline text-sm"
                    >
                      {file.originFileName}
                    </button>
                    <div className="relative w-12 h-12">
                      <Image
                        src={file.thumbnailFilePath}
                        alt="thumbnail"
                        fill
                        sizes="48px"
                        className="object-cover border rounded"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">📎 첨부파일이 없습니다.</p>
            )}
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => onEdit(schedule)}
          className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ✏️ 수정
        </button>
        <button
          onClick={() => onDelete(schedule.id)}
          className="px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          🗑 삭제
        </button>
      </div>
    </div >
  );
}
