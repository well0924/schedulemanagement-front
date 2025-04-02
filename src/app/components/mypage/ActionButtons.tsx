export default function ActionButtons() {
    return (
      <div className="flex gap-3 justify-end mt-6">
        <button className="bg-gray-200 text-sm px-4 py-2 rounded hover:bg-gray-300">
          비밀번호 변경
        </button>
        <button className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600">
          로그아웃
        </button>
      </div>
    );
  }
  