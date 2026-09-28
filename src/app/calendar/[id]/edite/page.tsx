'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ScheduleRequest, ScheduleResponse } from '@/app/utile/interfaces/calendar/calendarModel';
import { getPresignedUploadUrls, completeFileUpload } from '@/app/utile/api/AttachApi';
import { getCategoryList } from '@/app/utile/api/CategoryApi';
import { ScheduleById, updateSchedule } from '@/app/utile/api/ScheduleApi';
import { CategoryResponse } from '@/app/utile/interfaces/category/category';

export default function ScheduleEditPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState<Partial<ScheduleRequest>>({});
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]); 
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const id = Number(params.id);
        const data = await ScheduleById(id);
        setSchedule(data);
        setForm({
          contents: data.contents,
          startTime: data.startTime,
          endTime: data.endTime,
          categoryId: data.categoryId,
          repeatType: data.repeatType,
          repeatCount: data.repeatCount,
          repeatInterval: data.repeatInterval,
          isAllDay: data.isAllDay,
          userId: data.userId,
          scheduleMonth: new Date(data.startTime).getMonth() + 1,
          scheduleDays: new Date(data.startTime).getDate(),
          scheduleType: data.scheduleType,
          attachIds: data.attachFiles.map(f => f.id),
        });
        const categories = await getCategoryList();
        setCategories(categories);
      } catch (err) {
        console.error('불러오기 실패', err);
      }
    };
    loadData();
  }, [params]);

  const handleFileUpload = async (): Promise<number[]> => {
    if (!files || files.length === 0) return [];
    const fileNames = Array.from(files).map(file => file.name);
    setUploading(true);
    try {
      const presignedUrls = await getPresignedUploadUrls(fileNames);
      await Promise.all(
        presignedUrls.map((url, i) =>
          fetch(url, { method: 'PUT', body: files[i] })
        )
      );
      const uploaded = await completeFileUpload(fileNames);
      return uploaded.map(f => f.id);
    } catch (err) {
      console.error('업로드 실패', err);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (key: keyof ScheduleRequest, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.contents || !form.startTime || !form.endTime || !form.userId || !form.categoryId) {
      alert('필수 항목을 입력하세요');
      return;
    }
    const uploadedIds = await handleFileUpload();
    const body: ScheduleRequest = {
      ...form,
      attachIds: [...(form.attachIds || []), ...uploadedIds],
    } as ScheduleRequest;
    try {
      await updateSchedule(Number(params.id), body);
      alert('수정 완료');
      router.push('/');
    } catch (e) {
      console.error('수정 실패', e);
      alert('수정 실패');
    }
  };

  if (!schedule) return <p>불러오는 중...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">✏️ 일정 수정</h1>
      <div className="space-y-4">
        <input
          type="text"
          className="w-full border px-3 py-2 rounded"
          placeholder="내용"
          value={form.contents || ''}
          onChange={e => handleChange('contents', e.target.value)}
        />
        <input
          type="datetime-local"
          className="w-full border px-3 py-2 rounded"
          value={form.startTime?.slice(0, 16) || ''}
          onChange={e => handleChange('startTime', e.target.value)}
        />
        <input
          type="datetime-local"
          className="w-full border px-3 py-2 rounded"
          value={form.endTime?.slice(0, 16) || ''}
          onChange={e => handleChange('endTime', e.target.value)}
        />
        <select
          value={form.categoryId || ''}
          onChange={e => handleChange('categoryId', Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="file"
          multiple
          onChange={e => setFiles(e.target.files)}
        />
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {uploading ? '업로드 중...' : '수정하기'}
        </button>
      </div>
    </div>
  );
}