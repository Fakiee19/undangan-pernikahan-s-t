$url = "https://script.google.com/macros/s/AKfycbzNL_NLMbomyk0xxYMF64WtYtONiqKvH-RnCpk9ZxVmywDrUkEApxup9mKH_mM-TjdO/exec"

Write-Host "1. Menguji POST (mengirim data ucapan)..."
$body = '{"name":"Asisten AI","attend":true,"message":"Halo! Pengujian dari skrip otomatis berhasil."}'
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "text/plain" -ErrorAction Stop
    $resultPost = $response | ConvertTo-Json -Compress
    Write-Host "Response POST: $resultPost"
} catch {
    Write-Host "POST Error: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $errResponse = $reader.ReadToEnd()
        Write-Host "Detail Error POST: $errResponse"
    }
}

Write-Host "`n2. Menguji GET (mengambil data ucapan)..."
try {
    $responseGet = Invoke-RestMethod -Uri $url -Method Get -ErrorAction Stop
    $resultGet = $responseGet | ConvertTo-Json -Compress
    Write-Host "Response GET: sukses (Panjang: $($responseGet.Count) data)"
    Write-Host "Data awal: $($resultGet.Substring(0, [math]::Min($resultGet.Length, 300)))"
} catch {
    Write-Host "GET Error: $_"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $errResponse = $reader.ReadToEnd()
        Write-Host "Detail Error GET: $errResponse"
    }
}
