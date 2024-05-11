function getinfo(values) { // set spreadsheet values
    let players: string[] = [];
    let img_link_dic = {};
    for (let i = 0; i < values.length; i++) {
        if (i < 2 || values[i].length < 9 || values[i][10] === '') { continue; };
        players.push(values[i][10]);
        if (values[i][11] === undefined) {
            img_link_dic[values[i][10]] = "data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7";
        } else {
            img_link_dic[values[i][10]] = values[i][11];
        };
    };

    let gameinfos: any[] = [];
    let gameinfo = {};
    let gamename = "";
    for (let i = 0; i < values.length; i++) {
        if (i < 2 || values[i].length == 0) { continue; };
        if (values[i][0] !== '') {
            gameinfo = {};
            gamename = values[i][0];
            gameinfo['gamename'] = gamename;
            gameinfo['results'] = [];
        };
        const result = {
            'player': values[i][1],
            'img_link': img_link_dic[values[i][1]],
            'score': Number(values[i][2]),
            'win': Number(values[i][3]),
            't_o': Number(values[i][4]),
            't_o_set': Number(values[i][5]),
            'grade': Number(values[i][6]),
            'total_score': Number(values[i][7]),
            'total_grade': Number(values[i][8]),
        };
        gameinfo['results'].push(result);
        if (gameinfo['results'].length == 4) {
            gameinfos.push(gameinfo);
        }
    }

    for (let i = 0; i < gameinfos.length; i++){
        let total_scores: number[] = [];
        let gameinfo = gameinfos[i]['results'];
        console.log(gameinfo)
        for (let j = 0; j < gameinfo.length; j++){
            total_scores.push(gameinfo[j].total_score);
        }
        let win_flg = false;
        for (let j = 0; j < gameinfo.length; j++) {
            if (!win_flg && Math.max(...total_scores) == gameinfo[j].total_score) {
                gameinfo[j]['winner'] = true;
                win_flg = false;
            } else {
                gameinfo[j]['winner'] = false;
            }
        }
    }

    return [players, gameinfos];
}

export { getinfo };
