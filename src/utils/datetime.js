export function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);  // 将带T的时间字符串转为Date对象
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  // 月份需要+1，且补零
    const day = date.getDate().toString().padStart(2, '0');  // 补零
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}