document.addEventListener('DOMContentLoaded', () => {
    const screen1 = document.getElementById('screen1');
    const screen2 = document.getElementById('screen2');
    const screen3 = document.getElementById('screen3');

    const btnStart = document.getElementById('btn-start');
    const btnSubmit = document.getElementById('btn-submit');
    const btnBackHome = document.getElementById('btn-back-home');
    const btnBack1 = document.getElementById('btn-back-1');

    const noteInput = document.getElementById('note-input');
    const loadingSpinner = document.getElementById('loading');

    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    // Navigation handlers
    btnStart.addEventListener('click', () => {
        noteInput.value = ''; // clear input
        showScreen(screen2);
    });

    btnBackHome.addEventListener('click', () => {
        showScreen(screen1);
    });

    btnBack1.addEventListener('click', () => {
        showScreen(screen1);
    });

    // Submission handler
    btnSubmit.addEventListener('click', async () => {
        const text = noteInput.value.trim();
        if (!text) {
            alert('請輸入留言內容！');
            return;
        }

        // Show loading state
        loadingSpinner.classList.remove('hidden');
        btnSubmit.disabled = true;

        try {
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTRszzMdzJ22uF4zHgKumhvSK5W_wuCWVMg2rR7df3WlP_GDnZH7k9m-yjcevW7eAI/exec';
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('伺服器發生錯誤');
            }

            // Success
            showScreen(screen3);
        } catch (error) {
            console.error('Error submitting note:', error);
            alert('發送失敗，請稍後再試。');
        } finally {
            // Reset loading state
            loadingSpinner.classList.add('hidden');
            btnSubmit.disabled = false;
        }
    });
});
