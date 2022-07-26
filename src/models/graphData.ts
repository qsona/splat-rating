const Template = {
    "type": "line",
    "data": {
        "labels": [
        ],
        "datasets": [
            {
                "label": "Power",
                "fill": true,
                "data": [
                ],
                "backgroundColor": "rgba(78, 115, 223, 0.05)",
                "borderColor": "rgba(78, 115, 223, 1)"
            }
        ]
    },
    "options": {
        "maintainAspectRatio": false,
        "legend": {
            "display": false,
            "labels": {
                "fontStyle": "normal"
            }
        },
        "title": {
            "fontStyle": "normal"
        },
        "scales": {
            "xAxes": [
                {
                    "gridLines": {
                        "color": "rgb(234, 236, 244)",
                        "zeroLineColor": "rgb(234, 236, 244)",
                        "drawBorder": false,
                        "drawTicks": false,
                        "borderDash": [
                            "2"
                        ],
                        "zeroLineBorderDash": [
                            "2"
                        ],
                        "drawOnChartArea": false
                    },
                    "ticks": {
                        "fontColor": "#858796",
                        "fontStyle": "normal",
                        "padding": 20
                    }
                }
            ],
            "yAxes": [
                {
                    "gridLines": {
                        "color": "rgb(234, 236, 244)",
                        "zeroLineColor": "rgb(234, 236, 244)",
                        "drawBorder": false,
                        "drawTicks": false,
                        "borderDash": [
                            "2"
                        ],
                        "zeroLineBorderDash": [
                            "2"
                        ]
                    },
                    "ticks": {
                        "fontColor": "#858796",
                        "fontStyle": "normal",
                        "padding": 20
                    }
                }
            ]
        }
    }
}
export { Template }
