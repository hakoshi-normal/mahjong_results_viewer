function getinfo(values) { // set spreadsheet values
    let players = [];
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

    let gameinfos = [];
    let gameinfo = {};
    let gamename = "";
    for (let i = 0; i < values.length; i++) {
        if (i < 2 || values[i].length == 0 || values[i].filter(n => n === "").length > 3) { continue; };
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
        let total_scores = [];
        let gameinfo = gameinfos[i]['results'];
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

    // return [players, gameinfos];
    return gameinfos;
}


function round_val(value, base=100) {
    value = Math.round(value * base) / base;
    return value;
}

function get_personal_infos(gameinfos) {
    keys = ['score', 'win', 't_o', 't_o_set', 'grade', 'total_score', 'total_grade']
    tmp_personal_infos = {};
    for (gameinfo of gameinfos) {
        for (player_info of gameinfo.results) {
            if (!Object.keys(tmp_personal_infos).includes(player_info.player)) {
                tmp_personal_infos[player_info.player] = {};
                for (key of keys) {
                    tmp_personal_infos[player_info.player][`${key}s`] = [];
                }
            };
            for (key of keys) {
                tmp_personal_infos[player_info.player][`${key}s`].push(player_info[key]);
            };
        };
    };

    personal_infos = {};
    for (player of Object.keys(tmp_personal_infos)) {
        info = tmp_personal_infos[player];
        personal_infos[player] = {
            'games': info.scores.length, // 対局数
            'mean_win': round_val(info.wins.reduce((a, b) => a + b) / info.wins.length), // 平均和了数
            'mean_score': round_val(info.scores.reduce((a, b) => a + b) / info.scores.length), // 平均持ち点（ノーマル）
            'best_score': Math.max(...info.scores), // ベストスコア（ノーマル）
            'mean_grade': round_val(info.grades.reduce((a, b) => a + b) / info.grades.length), // 平均順位（ノーマル）
            'top_rate': round_val(info.grades.filter(n => n == 1).length / info.grades.length), // トップ率（ノーマル）
            'not_last_rate': round_val(info.grades.filter(n => n != 4).length / info.grades.length), // ラス回避率（ノーマル）
            'sum_t_o': info.t_os.reduce((a, b) => a + b), // 累計31牌数
            'sum_t_o_set': info.t_o_sets.reduce((a, b) => a + b), // 累計31暗刻槓子数
            'mean_total_score': round_val(info.total_scores.reduce((a, b) => a + b) / info.total_scores.length), // 平均持ち点（31）
            'best_total_score': Math.max(...info.total_scores), // ベストスコア（31）
            'mean_total_grade': round_val(info.total_grades.reduce((a, b) => a + b) / info.total_grades.length), // 平均順位（31）
            'total_top_rate': round_val(info.total_grades.filter(n => n == 1).length / info.total_grades.length), // トップ率（31）
            'total_not_last_rate': round_val(info.total_grades.filter(n => n != 4).length / info.total_grades.length), // ラス回避率（31）
        };
    };
    return personal_infos;
};


function draw_table(gameinfos) {
    personal_infos = get_personal_infos(gameinfos);
    personal_data = [];
    for (key of Object.keys(personal_infos)) {
        info = personal_infos[key];
        personal_data.push([key, info.games, info.mean_win, info.sum_t_o, info.sum_t_o_set,
            info.mean_total_score, info.best_total_score, info.mean_total_grade,
            info.total_top_rate, info.total_not_last_rate,
            info.mean_score, info.best_score, info.mean_grade,
            info.top_rate, info.not_last_rate,])
    }

    new gridjs.Grid({
        columns: ["プレイヤー", "対局数", "平均和了数", "累計31牌数", "累計31暗刻槓子数",
            "平均持ち点(31)", "ベストスコア(31)", "平均順位(31)", "トップ率(31)", "ラス回避率(31)",
            "平均持ち点", "ベストスコア", "平均順位", "トップ率", "ラス回避率"],
        data: personal_data,
        sort: true,
        resizable: true,
        width: "90vw",
        style: {
            th: { "color": "white", "background-color": "rgb(242, 12, 144)", "font-size": "8pt", 'text-align': 'center'},
            td: { "color": "rgb(7, 33, 155)", "font-size": "10pt", 'text-align': 'center' }
        }
    }).render(document.getElementById("table"));
}


function generate_html(gameinfos) {
    console.log(gameinfos)
    results = "";
    for (i = 0; i < gameinfos.length; i++){
        text = ""
        for (j = 0; j < gameinfos[i].results.length; j++){
            result = gameinfos[i].results[j];
            winner_anim_html = "";
            if (result.winner) {
                winner_anim_html = `<div class="rainbow" id="tonrainbow">
                                        <div class="rainbow1"></div>
                                    </div>`
            }
            text += `<div class="player_base player_base${j + 1}">
                        ${winner_anim_html}
                        <div class="player_field">
                            <div class="player_name_field player_name_text">
                            ${result.player}&nbsp;</div>
                            <div class="player_kaze_text">${['東','南','西','北'][j]}</div>
                            <img class="icon" src="${result.img_link}">
                            <div class="player_result_field player_result_text">
                                持ち点 :&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;和了回数 :<br><br>
                                31牌数:&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;31暗刻槓:
                                <div class="total_score_label">total</div>
                                <div class="info_text score_text">${result.score.toLocaleString()}</div>
                                <div class="info_text win_text">${result.win}</div>
                                <div class="info_text t_o_text">${result.t_o}</div>
                                <div class="info_text t_o_set_text">${result.t_o_set}</div>
                                <div class="total_score_text">${result.total_score.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>`
        };
        results += `<div class="game_field" id="game${i + 1}">
                    <div class="game_name_field">${gameinfos[i].gamename}</div>
                    ${text}</div><div class="space"></div>`;
    };
    document.getElementById('game_results').innerHTML += results;
};

async function main() {
    const response = await fetch(`/gameinfos?mode=${location.pathname.replace('/',"")}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const values = JSON.parse(await response.text());
    const gameinfos = getinfo(values);
    generate_html(gameinfos);
    draw_table(gameinfos);
};

window.addEventListener("load", (event) => {
    main();
});
