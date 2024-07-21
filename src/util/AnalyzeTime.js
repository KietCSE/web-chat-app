function getMinuteAndHour(dateTime) {
    const [timePart] = dateTime.split("T")[1].split(".")[0].split(":");
    const [hours, minutes] = timePart.split(":").slice(0, 2);
    return `${hours}:${minutes}`
}

module.exports = {
    getMinuteAndHour
}