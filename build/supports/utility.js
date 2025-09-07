export var Utility;
(function (Utility) {
    function datetime(datetime, splitter = '-') {
        const map = Object.fromEntries(new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(datetime || new Date())
            .map(p => [p.type, p.value]));
        return `${map.year}${splitter}${map.month}${splitter}${map.day}${splitter}${map.hour}${splitter}${map.minute}${splitter}${map.second}`;
    }
    Utility.datetime = datetime;
})(Utility || (Utility = {}));
