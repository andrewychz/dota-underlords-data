var log = console.log.bind(console)

log('content_script.js ready')

 // https://stackoverflow.com/questions/9602022/chrome-extension-retrieving-global-variable-from-webpage
// var s = document.createElement('script');
// s.src = chrome.extension.getURL('content_script.js');
// (document.head||document.documentElement).appendChild(s);
// s.onload = function() {
//     s.remove();
// };

var $J = $

chrome.runtime.onMessage.addListener(function(message, _, sendResponse) {
    if (message.content == 'NeedFrame') {
        // var element = document.querySelector('div.entryWrapper')
        // sendResponse({
        //     "x" : element.offsetLeft,
        //     "y" : element.offsetTop,
        //     "width" : element.offsetWidth,
        //     "height" : element.offsetHeight
        // })

        // https://stackoverflow.com/questions/3209790/jquery-in-google-chrome-content-script

        var g_sGcContinueToken = ''
        var g_sessionID = ''

        function ElementsContainerHistory_LoadMore() { 
            $J("#load_more_button").hide(); 
            $J("#inventory_history_loading").show(); 
            log('normal')
            display(); 
            var request_data = { 
                ajax: 1, 
                tab: "Matches", 
                continue_token: g_sGcContinueToken, 
                sessionid: g_sessionID 
            }; 
            $J.ajax({ 
                type: "GET", 
                url: $J(".playerAvatar a:first").attr("href") + "/gcpd/1046930", 
                data: request_data 
            }) 
                .done(function(data) { 
                if (data.success) { 
                    if (data.html) { 
                    var rgChildren = $J("#personaldata_elements_container").children(); 
                    var elem_prev = rgChildren.last(); 
        
                    if (rgChildren.length == 1 && elem_prev.prop("tagName") === "TABLE") { 
                        $J("#personaldata_elements_container").append(data.html); 
        
                        var rgNewChildren = $J("#personaldata_elements_container").children(); 
                        if (rgNewChildren.length == 2 && rgNewChildren.last().prop("tagName") === "TABLE") { 
                        var last_row = elem_prev 
                            .find("tr") 
                            .filter(":first") 
                            .parent() 
                            .children() 
                            .last(); 
                        elem_prev.children().append( 
                            rgNewChildren 
                            .last() 
                            .find("tr") 
                            .filter(":first") 
                            .nextAll() 
                            .clone() 
                        ); 
                        rgNewChildren.last().remove(); 
        
                        var new_elems = last_row.nextAll(); 
                        new_elems.hide(); 
                        new_elems.fadeIn(500); 
                        } 
                    } else { 
                        $J("#personaldata_elements_container").append(data.html); 
        
                        var new_elems = elem_prev.nextAll(); 
                        new_elems.hide(); 
                        new_elems.fadeIn(500); 
                    } 
                    } 
        
                    if (data.continue_token) { 
                    g_sGcContinueToken = data.continue_token; 
                    $J("#load_more_button").fadeIn(50); 
                    ElementsContainerHistory_LoadMore(); 
                    } else { 
                    $J("#load_more_button").hide(); 
                    statistics(); 
                    } 
                } else { 
                    $J("#load_more_button").fadeIn(50); 
                    ElementsContainerHistory_LoadMore(); 
                    ShowAlertDialog("错误", "Dota Underlords“比赛”的个人游戏数据当前不可用。请稍后再来。", "确定"); 
                } 
                }) 
                .fail(function(jqXHR) { 
                $J("#load_more_button").fadeIn(50); 
                ElementsContainerHistory_LoadMore(); 
        
                if (jqXHR.status == 429) { 
                    ShowAlertDialog("错误", "您最近作出的请求太多了。请稍候再重试您的请求。", "确定"); 
                } else { 
                    ShowAlertDialog("错误", "Dota Underlords“比赛”的个人游戏数据当前不可用。请稍后再来。", "确定"); 
                } 
                }) 
                .always(function() { 
                $J("#inventory_history_loading").hide(); 
                }); 
            } 
            function statistics() { 
            var data = $J("#personaldata_elements_container tr:not(:eq(0))") 
                .toArray() 
                .map(function(n) { 
                return $J(n) 
                    .children() 
                    .toArray() 
                    .map(function(m) { 
                    return m.innerHTML; 
                    }); 
                }); 
            var resultHuman = analyse(data, 1); 
            display(resultHuman, 1); 
            var resultMachine = analyse(data, 2); 
            display(resultMachine, 2); 
            } 
            function analyse(data, mode) { 
            var index = { 
                mode: 1, 
                date: 2, 
                rounds: 14, 
                rank: 11 
            }; 
        
            if (mode) 
                data = data.filter(function(n) { 
                return n[index.mode] == mode; 
                }); 
            var result = { 
                count: 0, 
                top1: 0, 
                top3: 0, 
                top4: 0, 
                last: 0, 
                escape: 0 
            }; 
            data.forEach(function(cur) { 
                result.count++; 
                result.last += cur[index.rank] == 8; 
                [1, 3, 4].forEach(function(v, i) { 
                var item = "top" + v; 
                result[item] += cur[index.rank] <= v; 
                }); 
                result.escape += cur[index.rank] == 8 && cur[index.rounds] <= 10; 
                return result; 
            }, result); 
            return result; 
            } 
            function display(total, type) { 
            var anchor = "#personaldata_elements_container"; 
            if (!total) { 
                !$J("#loading")[0] && $J(`<div id='result'><div style='font-size:22px;color:white' id='loading'>loading...<div></div>`).insertBefore(anchor); 
            } else { 
                $J("#loading").remove(); 
                $J(`#result`).append( 
                `<table style='border:solid 1px white' class='generic_kv_table'><tbody><tr><th>总局数(${ 
                    type == 1 ? "人" : "机器" 
                })</th><th>恰鸡</th><th>前三</th><th>烂分</th><th>恰鸡屎</th><th>秒退</th></tr>` + 
                    `</tbody><td>${total.count}</td><td>${total.top1}</td><td>${total.top3}</td><td>${total.top4}</td><td>${total.last}</td><td>${ 
                    total.escape 
                    }</td></table>` 
                ); 
            } 
            } 
            ElementsContainerHistory_LoadMore();
    }
})
