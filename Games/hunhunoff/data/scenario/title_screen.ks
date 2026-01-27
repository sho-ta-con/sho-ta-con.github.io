[_tb_system_call storage=system/_title_screen.ks]

*title


;==============================
; タイトル画面
;==============================


[hidemenubutton]

[tb_clear_images]

[tb_keyconfig  flag="0"  ]

;標準のメッセージレイヤを非表示


[tb_hide_message_window  ]

;タイトル表示


[playbgm  volume="10"  time="1000"  loop="true"  storage="Picnic_Always_Fun.mp3"  ]
[bg  storage="hunhuntitle.jpg"  time="0"  ]
[tb_eval  exp="f.flg1=0"  name="flg1"  cmd="="  op="t"  val="0"  val_2="undefined"  ]
[button  storage="title_screen.ks"  target="*start"  graphic="button_title_off.gif"  width="540"  height="80"  x="370"  y="400"  _clickable_img=""  ]
[s  ]

;-------ボタンが押されたときの処理


*start

[cm  ]
[tb_keyconfig  flag="1"  ]
[jump  storage="scene1.ks"  target=""  ]
[s  ]
[s  ]
