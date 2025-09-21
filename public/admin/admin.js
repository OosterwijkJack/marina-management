function DownloadResData(){
    fetch("/api/download-excel")
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Reservation_data.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
}