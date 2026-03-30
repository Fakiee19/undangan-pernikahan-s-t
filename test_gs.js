const url = 'https://script.google.com/macros/s/AKfycbzNL_NLMbomyk0xxYMF64WtYtONiqKvH-RnCpk9ZxVmywDrUkEApxup9mKH_mM-TjdO/exec';

async function testGS() {
    console.log("1. Menguji POST (mengirim data ucapan)...");
    try {
        const postRes = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                name: 'Asisten AI',
                attend: true,
                message: 'Pesan sistem: Uji coba otomatis berhasil. Endpoint Google Sheets Anda siap digunakan!'
            })
        });
        const postText = await postRes.text();
        console.log("Response POST Status:", postRes.status);
        console.log("Response POST Body:", postText);

        console.log("\n2. Menguji GET (mengambil data ucapan)...");
        const getRes = await fetch(url);
        const getText = await getRes.text();
        console.log("Response GET Status:", getRes.status);
        console.log("Response GET Body excerpt:", getText.substring(0, 300));

        try {
            const parsed = JSON.parse(getText);
            console.log("SUCCESS: Response GET valid JSON!");
            console.log("Jumlah Data:", parsed.length);
        } catch (e) {
            console.log("ERROR: Response GET is not valid JSON.");
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}
testGS();
