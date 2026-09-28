'use client';

import { ScheduleRequest } from '@/app/utile/interfaces/calendar/calendarModel';
import { CategoryResponse } from '@/app/utile/interfaces/category/category';
import { completeFileUpload, getPresignedUploadUrls } from '@/app/utile/api/AttachApi';
import { CategoryCreate, getCategoryList } from '@/app/utile/api/CategoryApi';
import { fetchUserIdFromServer } from '@/app/utile/api/LoginApi';
import { useAuth } from '@/app/utile/context/AuthContext';
import { useEffect, useState } from 'react';


interface Props {
    isOpen: boolean;
    onClose: () => void;
    onScheduleAdd?: (schedule: ScheduleRequest) => void;
}

export default function AddScheduleModal({ isOpen, onClose, onScheduleAdd }: Props) {
    const [contents, setContents] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isAllDay, setIsAllDay] = useState(false);
    const [categoryId, setCategoryId] = useState(1); // 기본 카테고리 ID
    const [categories, setCategories] = useState<CategoryResponse[]>([]); // 카테고리 응답
    const [newCategoryName, setNewCategoryName] = useState('');
    const [repeatType, setRepeatType] = useState<ScheduleRequest['repeatType']>('NONE');
    const [repeatCount, setRepeatCount] = useState(0);
    const [repeatInterval, setRepeatInterval] = useState(0);
    const [userId, setUserId] = useState<number | null>(null);
    const { accessToken } = useAuth();
    const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
    const [files, setFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isDark, setIsDark] = useState(false);

    //로그인한 회원의 번호 가져오기.
    useEffect(() => {
        const getUserId = async () => {
            if (!accessToken) return;
            try {
                const id = await fetchUserIdFromServer(accessToken);
                setUserId(id);
            } catch (e) {
                console.error("userId 가져오기 실패:", e);
            }
        };
        getUserId();
    }, [accessToken]);

    // 다크모드 클래스 변경 감지
    useEffect(() => {
        const checkDark = () => {
            const hasDark = document.documentElement.classList.contains("dark");
            setIsDark(hasDark);
        };
        checkDark();
        const observer = new MutationObserver(() => {
            checkDark();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    //카테고리 목록 가져오기.
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const result = await getCategoryList();
                setCategories(result);
                if (result.length > 0) {
                    setCategoryId(result[0].id); // 기본 선택
                }
            } catch (e) {
                console.error('카테고리 불러오기 실패:', e);
            }
        };
        loadCategories();
    }, []);

    //카테고리 추가.
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const newCat = await CategoryCreate({
                name: newCategoryName,
                parentId: parentCategoryId,  // 최상위 카테고리
                depth: parentCategoryId ? 2 : 1  // 기본 깊이
            });
            console.log(newCat);
            setCategories((prev) => [...prev, newCat]);
            setCategoryId(newCat.id);
            setNewCategoryName('');
        } catch (e: unknown) {
            console.log(e);
            alert('카테고리 생성 실패');
        }
    };

    const handleFileUpload = async (): Promise<number[]> => {
        if (!files || files.length === 0) return [];

        const fileNames = Array.from(files).map(file => file.name);
        setUploading(true);

        try {
            // 1. presigned upload URL 목록 요청
            const presignedUrls = await getPresignedUploadUrls(fileNames);

            // 2. 각 presigned URL로 실제 S3 업로드
            const results = await Promise.all(
                presignedUrls.map((url, i) =>
                    fetch(url, {
                        method: 'PUT',
                        body: files[i],
                    })
                )
            );
            // fetch는 4xx/5xx에도 예외를 던지지 않으므로 직접 확인
            if (results.some(r => !r.ok)) throw new Error('S3 업로드 실패');

            // 3. 업로드 완료 후 DB에 등록 요청
            const attachResponses = await completeFileUpload(fileNames);
            return attachResponses.map(res => res.id);

        } catch (err) {
            console.error("파일 업로드 실패", err);
            alert('파일 업로드에 실패했습니다. 첨부파일 없이 일정이 저장됩니다.');
            return [];
        } finally {
            setUploading(false);
        }
    };

    //일정 타입분류
    const classifyScheduleType = (
        start: string,
        end: string,
        isAllDay: boolean
    ): 'ALL_DAY' | 'SINGLE_DAY' | 'MULTI_DAY' => {
        const startDate = new Date(start).toISOString().slice(0, 10);
        const endDate = new Date(end).toISOString().slice(0, 10);

        if (startDate === endDate) {
            return isAllDay ? 'ALL_DAY' : 'SINGLE_DAY';
        } else {
            return 'MULTI_DAY';
        }
    };

    const handleSubmit = async () => {

        if (!userId) {
            alert('로그인 정보가 없습니다.');
            return;
        }

        if (!contents.trim() || !startDate || !endDate || !startTime || !endTime || !categoryId) {
            alert('모든 값을 입력해주세요.');
            return;
        }

        const startDateTime = isAllDay ? `${startDate}T00:00` : `${startDate}T${startTime}`;
        const endDateTime = isAllDay ? `${endDate}T23:59` : `${endDate}T${endTime}`;

        if (!isAllDay && startTime >= endTime) {
            alert('시작 시간이 종료 시간보다 빠르거나 같을 수 없습니다.');
            return;
        }

        const attachIds = await handleFileUpload();

        const scheduleType = classifyScheduleType(startDateTime, endDateTime, isAllDay);

        const scheduleData: ScheduleRequest = {
            contents,
            scheduleMonth: new Date(startDate).getMonth() + 1,
            scheduleDays: new Date(startDate).getDate(),
            startTime: startDateTime,
            endTime: endDateTime,
            userId, // 실제 로그인 유저 정보 필요
            categoryId,
            repeatType,
            repeatCount,
            repeatInterval,
            isAllDay,
            scheduleType,
            attachIds // 첨부파일 추후 처리
        };
        console.log(scheduleData);
        onScheduleAdd?.(scheduleData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40`}>
            <div className={`w-full max-w-sm sm:max-w-md p-6 rounded shadow-lg transition-colors duration-300 ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
                <h2 className="text-lg font-bold mb-4">📝 일정 추가</h2>
                <div className="space-y-3">
                    <input
                        type="text"
                        name='contents'
                        placeholder="일정 내용"
                        className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                        value={contents}
                        onChange={(e) => setContents(e.target.value)}
                    />
                    <input
                        type="checkbox"
                        name='isAllDay'
                        checked={isAllDay}
                        onChange={() => setIsAllDay(!isAllDay)}
                        className={`w-4 h-4 rounded ${isDark ? "text-blue-500 bg-gray-700 border-gray-600" : "text-blue-500 bg-gray-100 border-gray-300"}`}
                    />
                    <label className="text-sm">하루 종일 일정</label>

                    <br></br>
                    {/* 시작 날짜/시간 */}
                    <label className="text-sm font-semibold">시작</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <input
                            type="time"
                            className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            disabled={isAllDay}
                        />
                    </div>

                    {/* 종료 날짜/시간 */}
                    <label className="text-sm font-semibold">종료</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                        <input
                            type="time"
                            className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            disabled={isAllDay}
                        />
                    </div>

                    <select
                        className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                        value={parentCategoryId ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            setParentCategoryId(val === '' ? null : Number(val));
                        }}
                    >
                        <option value="">상위 카테고리 선택 (없으면 최상위)</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">카테고리 선택</label>
                        <select
                            className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                            value={categoryId ?? ''}
                            onChange={(e) => setCategoryId(Number(e.target.value))}
                        >
                            {categories.length === 0 ? (
                                <option disabled value="">카테고리를 먼저 추가해주세요</option>
                            ) : (
                                categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))
                            )}
                        </select>

                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="새 카테고리명 입력"
                                className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"} flex-1`}
                            />
                            <button
                                onClick={handleAddCategory}
                                className={`px-4 py-2 text-sm rounded transition-colors duration-300 bg-blue-500 text-white hover:bg-blue-600`}
                            >
                                추가
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">반복 설정</label>
                        <select
                            className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                            value={repeatType}
                            onChange={(e) => setRepeatType(e.target.value as ScheduleRequest['repeatType'])}
                        >
                            <option value="NONE">반복 없음</option>
                            <option value="DAILY">매일</option>
                            <option value="MONTHLY">매월</option>
                            <option value="YEARS">매년</option>
                        </select>

                        <input
                            type="number"
                            min={0}
                            className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                            value={repeatCount}
                            onChange={(e) => setRepeatCount(Number(e.target.value))}
                            disabled={repeatType === 'NONE'}
                            placeholder="반복 횟수 (예: 5)"
                        />

                        <label className="text-sm font-semibold">반복 간격</label>
                        <input
                            type="number"
                            min={0}
                            className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                            value={repeatInterval}
                            onChange={(e) => setRepeatInterval(Number(e.target.value))}
                            disabled={repeatType === 'NONE'}
                            placeholder="반복 간격 (예: 1일 간격이면 1)"
                        />
                    </div>
                    {/*첨부파일*/}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">첨부파일</label>
                        <input
                            type="file"
                            multiple
                            className={`w-full border px-3 py-2 rounded text-sm transition-colors duration-300
                                    ${isDark ? "bg-gray-700 text-white border-gray-600 focus:outline-none focus:border-blue-500" : "bg-gray-100 text-black border-gray-300 focus:outline-none focus:border-blue-500"}`}
                            onChange={(e) => setFiles(e.target.files)}
                        />
                        {files && (
                            <ul className="text-sm mt-2 list-disc pl-5 text-gray-700">
                                {Array.from(files).map((file, i) => (
                                    <li key={i}>{file.name}</li>
                                ))}
                            </ul>
                        )}
                        {uploading && <p className="text-sm text-blue-500">📤 파일 업로드 중...</p>}
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-sm rounded transition-colors duration-300 bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600`}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={
                            !contents.trim() || !startDate || !endDate || (!isAllDay && (!startTime || !endTime)) || !categoryId || !userId
                        }
                        className={`px-4 py-2 text-sm rounded transition-colors duration-300 bg-blue-500 text-white disabled:bg-gray-400 dark:disabled:bg-gray-600`}
                    >
                        {uploading ? '업로드 중...' : '등록'}
                    </button>
                </div>
            </div>
        </div>
    );
}