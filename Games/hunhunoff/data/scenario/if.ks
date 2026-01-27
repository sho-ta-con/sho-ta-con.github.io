[_tb_system_call storage=system/_if.ks]

*ifstart

[playbgm  volume="10"  time="1000"  loop="true"  storage="music.mp3"  ]
[tb_show_message_window  ]
[bg  time="500"  method="fadeIn"  storage="Black.jpg"  ]
[tb_start_text mode=1 ]
#
ライブ１週間前……[p]
[_tb_end_text]

[bg  storage="20260122_132136.jpg"  time="500"  ]
[chara_show  name="ぷろしゃん"  time="500"  wait="true"  storage="chara/2/F8PJGM0akAAP1W-.png"  width="600"  height="600"  top="10"  ]
[tb_start_text mode=1 ]
#ぷろしゃん
50分に東京着予定～[p]
#鯖メン
来週だよね？[p]
#ぷろしゃん
ホントだ[p]
#鯖メン
ぷろしゃん東京なう？[p]
#ぷろしゃん
まぁいるよ[p]
#鯖メン
ウキウキな河童さんかわちいねぇ[p]
#人類悪
ぷろしゃん……[p]
#ぷろしゃん
起きたときに「そういえば今日東京いかないとじゃね？」とボンヤリ思ったのが良くなかったわねぇ[p]
折角だからお店の場所だけ確認しておきますわ[p]
#人類悪
おねがいしまーす[p]
ぷろしゃんがうっかりしてくれたおかげで当日迷わなさそうでたすかりますなー[p]
#ふんふん
！？[p]
ウキウキかっぱしゃんかわちいすぎるだろwwwwww[p]
#
[_tb_end_text]

[glink  color="black"  storage="if.ks"  size="20"  autopos="true"  text="お散歩しつつそのまま帰る"  target="*normal1"  ]
[glink  color="black"  storage="if.ks"  size="20"  autopos="true"  text="リマインドメッセージを送る"  target="*if1"  ]
[s  ]
*normal1

[bg  storage="20260122_133403.jpg"  time="500"  ]
[tb_start_text mode=1 ]
#ぷろしゃん
折角だから、有楽町まで歩いて交通会館でアンテナショップ巡りしたった[p]
駅周りで素材用の写真撮って周辺ウロウロしてラーメン食べてきたからとりあえず満足[p]
#
[_tb_end_text]

[jump  storage="if.ks"  target="*event1end"  ]
*if1

[bg  storage="20260122_133403.jpg"  time="500"  ]
[tb_start_text mode=1 ]
#ぷろしゃん
折角だから、有楽町まで歩いて交通会館でアンテナショップ巡りしたった[p]
駅周りで素材用の写真撮って周辺ウロウロしてラーメン食べてきたからとりあえず満足[p]
本番は来週だからな！みんなも気をつけろよ！[p]
#ふんふん
そんなぷろしゃんみたいなことするわけwwwwww[p]
#
[_tb_end_text]

[tb_eval  exp="f.flg1+=1"  name="flg1"  cmd="+="  op="t"  val="1"  val_2="undefined"  ]
*event1end

[chara_hide  name="ぷろしゃん"  time="0"  wait="false"  pos_mode="true"  ]
[bg  time="500"  method="fadeIn"  storage="Black.jpg"  ]
[tb_start_text mode=1 ]
#
ライブ前日……[p]
[_tb_end_text]

[glink  color="black"  storage="if.ks"  size="20"  autopos="true"  text="いつも通りの日々を過ごす"  target="*normal2"  ]
[glink  color="black"  storage="if.ks"  size="20"  autopos="true"  text="リマインドメッセージを送る"  target="*if2"  ]
[s  ]
*normal2

[bg  storage="discord_26262882.png"  time="500"  ]
[tb_start_text mode=1 ]
#鯖メン
なにこれ、「これはピザか、焼そばか？」だって[p]
#ぷろしゃん
カップ焼きそばはカップ焼きそばだるぉ[p]
おいしそうではある[p]
#鯖メン
そうなんだよにゃー[p]
#人類悪
食べてみたさはある[p]
#鯖メン
そうなんだよにゃーー[p]
#
[_tb_end_text]

[jump  storage="if.ks"  target="*event2end"  ]
*if2

[bg  storage="discord_26262882.png"  time="500"  ]
[tb_start_text mode=1 ]
#人類悪
ついに明日！よろしくお願いしまーす[p]
#ぷろしゃん
今度こそみんなでランチに[p]
地下だと合流わかりにくいかもと思うので、合流したら地下通って行きましょ[p]
#人類悪
おー、やったー[p]
#
[_tb_end_text]

[tb_eval  exp="f.flg1+=2"  name="flg1"  cmd="+="  op="t"  val="2"  val_2="undefined"  ]
*event2end

[bg  time="500"  method="fadeIn"  storage="Black.jpg"  ]
[tb_start_text mode=1 ]
#
ライブ当日 昼[p]
[_tb_end_text]

[jump  storage="if.ks"  target="*ifend"  cond="f.flg1==3"  ]
*normalend

[bg  storage="20260127_124402.jpg"  time="500"  ]
[chara_show  name="ぷろしゃん"  time="500"  wait="true"  storage="chara/2/F8PJGM0akAAP1W-.png"  width="600"  height="600"  top="10"  ]
[tb_start_text mode=1 ]
#ぷろしゃん
丸の内南口ーついたー[p]
案内板の近くにいるます[p]
#人類悪
はーい[p]
#
[_tb_end_text]

[chara_show  name="人類悪"  time="500"  wait="true"  storage="chara/3/riyo.png"  width="504"  height="396"  top="90"  ]
[tb_start_text mode=1 ]
#人類悪
無事合流！[p]
>ふんふん 起きてるー？[p]
#
15分後[p]
#人類悪
という事で、ふんふん太郎は置いていくぜ！[p]
#鯖メン
草[p]
[_tb_end_text]

[chara_hide  name="ぷろしゃん"  time="0"  wait="false"  pos_mode="true"  ]
[chara_hide  name="人類悪"  time="0"  wait="false"  pos_mode="true"  ]
[bg  time="500"  method="fadeIn"  storage="Black.jpg"  ]
[tb_start_text mode=1 ]
#
その日の夜……[p]
[_tb_end_text]

[bg  storage="discord_26262882.png"  time="500"  ]
[tb_start_text mode=1 ]
#ふんふん
ぁ...[p]
ぁ...[p]
ややややややややややややややややらかしたやばい[p]
日にち、勘違いしてた、、、、[p]
人生初めて無言ドタキャンしてしまった๐·°(৹˃ᗝ˂৹)°·๐[p]
うわぁぁぁぁぁぁぁぁぁぁぁぁ[p]
[_tb_end_text]

[playse  volume="20"  time="1000"  buf="0"  storage="ショック5.mp3"  ]
[tb_start_text mode=1 ]
#ふんふん
大変申し訳ございませんでした...[p]
ただいま気が付きました。[p]
待たせてしまって＆ドタキャンしてしまってすみませんでした...๐·°(৹˃̵﹏˂̵৹)°·๐[p]
カレンダーにはしっかり書いてあったのに、カレンダーを見損ねていて、完全に明日だと勘違いしていました...[p]
うっ会いたかった...美味しいご飯食べたかった...[p]
ドタキャン野郎ですすみませんほんとに( ;ㅿ; )[p]
#鯖メン
16時くらいと予想していたが越えてきたなー[p]
#人類悪
よかった生きてた！！！[p]
#ぷろしゃん
いや体調ﾀﾋんでたりしたわけじゃなくてよかったよかった[p]
#鯖メン
ほんそれ[p]
#ふんふん
や、優しすぎるほんとすみません...[p]
#人類悪
まあそういうこともあるさー[p]
でもホント何事もなくて良かったよ[p]
3人中2人が日付勘違いするとかそんなことある〜？？？[p]
#鯖メン
この言葉を送っておきますね[p]
#鯖メン(悪)
「うっかりふんふんかわちいすぎるだろwwwwww」[p]
#
[_tb_end_text]

[stopbgm  time="1000"  fadeout="false"  ]
[jump  storage="if.ks"  target="*gameend"  ]
*ifend

[bg  storage="20260127_124402.jpg"  time="500"  ]
[chara_show  name="ぷろしゃん"  time="500"  wait="true"  storage="chara/2/F8PJGM0akAAP1W-.png"  width="600"  height="600"  top="10"  ]
[tb_start_text mode=1 ]
#ぷろしゃん
丸の内南口ーついたー[p]
案内板の近くにいるます[p]
#人類悪
はーい[p]
#
[_tb_end_text]

[chara_show  name="人類悪"  time="500"  wait="true"  storage="chara/3/riyo.png"  width="504"  height="396"  top="90"  ]
[tb_start_text mode=1 ]
#人類悪
無事合流！[p]
>ふんふん 起きてるー？[p]
#ふんふん
え！？[p]
あぶね！今日だった！[p]
今から行きます！[p]
でもごめんなさい、少し遅れるかも…[p]
#ぷろしゃん
あぶなかったねー[p]
#人類悪
ゆっくりおいでー[p]
#
[_tb_end_text]

[chara_show  name="ふんふん"  time="500"  wait="true"  storage="chara/1/65_20230128003638.png"  width="430"  height="430"  top="70"  ]
[tb_start_text mode=1 ]
#ふんふん
ついた！遅くなってごめんなさい！[p]
#人類悪
ええんやで[p]
#ふんふん
カレンダーにはしっかり書いてあったのに、カレンダーを見損ねていて、完全に明日だと勘違いしていました...[p]
#ぷろしゃん
体調ﾀﾋんでたりしたわけじゃなくてよかったよかった[p]
#人類悪
それじゃあみんな揃ったところで、ぷろしゃんあとはまかせたー[p]
#ぷろしゃん
はいはい、じゃあこっちですよ[p]
#人類悪
それにしても[p]
3人中2人が日付勘違いするとかそんなことある〜？？？[p]
#
[_tb_end_text]

[tb_hide_message_window  ]
[chara_hide  name="ふんふん"  time="1000"  wait="false"  pos_mode="true"  ]
[chara_hide  name="ぷろしゃん"  time="1000"  wait="false"  pos_mode="true"  ]
[chara_hide  name="人類悪"  time="1000"  wait="false"  pos_mode="true"  ]
[bg  time="2000"  method="crossfade"  storage="white.png"  ]
[stopbgm  time="2000"  fadeout="true"  ]
[jump  storage="if.ks"  target="*gameend"  ]
*gameend

[bg  time="1000"  method="crossfade"  storage="title.jpg"  ]
[tb_show_message_window  ]
[tb_start_text mode=1 ]
#
こうして、ふんふんのオフ会は幕を閉じたのであった[p]
[_tb_end_text]

[tb_hide_message_window  ]
[playse  volume="20"  time="1000"  buf="0"  storage="nc43997-［効果音・アタック］オチの音（ちゃんちゃん）.mp3"  ]
[wse  ]
[jump  storage="title_screen.ks"  target="*title"  ]
