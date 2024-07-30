//追加した機能：部分一致で判別できる、時刻を答える、二度目だと返答が変わる
let date = new Date();

var response = {
    "誰":"誰だと思う？",
    "何歳":"失礼だなあ",
    "元気":"元気だよ",
	"こんにちは":"こんにちは",
	"おはよう":"おはようー",
    "好き,食べ物":"駄菓子かな",
	"好き,飲み物":"水道水かな",
	"さようなら":"じゃあねー",
	"よろしく":"どうも",
	"初めまして":"はじめまして",
	"何時":date.getHours() + "時"　+ date.getMinutes() + "分だよ",
	"何分":date.getMinutes() + "分だよ",
	"和歌山,天気": ["これ見たらわかるでしょ", "https://tenki.jp/forecast/6/33/6510/30201/10days.html"],
	"大阪,天気": ["大阪府民じゃないんだけど。これでも見といて", "https://tenki.jp/forecast/6/30/"],
};
    

const resultOutput = document.querySelector('#resultOutput'); // 結果出力エリア
const startButton = document.querySelector('#startButton'); // 開始ボタン
const stopButton = document.querySelector('#stopButton'); // 停止ボタン

if (!'SpeechSynthesisUtterance' in window) {
    alert("あなたのブラウザはSpeech Synthesis APIに未対応です。");
}
const tts = new SpeechSynthesisUtterance(); // TTSインスタンスを生成
//tts.text = textForm.value; // テキストを設定
tts.lang = "ja-JP"; // 言語(日本語)、英語の場合はen-US
tts.rate = 2.0; // 速度
tts.pitch = 1.3; // 声の高さ
tts.volume = 1.0; // 音量

SpeechRecognition = webkitSpeechRecognition || SpeechRecognition;
if (!'SpeechRecognition' in window) {
    alert("あなたのブラウザはSpeech Recognition APIに未対応です。");
}

const asr = new SpeechRecognition(); // ASRインスタンスを生成
asr.lang = "ja-JP"; // 言語（日本語）
asr.interimResults = true; // 途中結果出力をオン
asr.continuous = true; // 継続入力をオン
let output = ''; // 出力

// 認識結果が出力されたときのイベントハンドラ
asr.onresult = function(event){
    let transcript = event.results[event.resultIndex][0].transcript; // 結果文字列
	tts.text = transcript;
	let newText = tts.text.replace(/\r?\n/g,'').replace(/\0/g,''); 
	let textbox_element = document.getElementById('resultOutput');
	let new_you = document.createElement('p');//あなたの質問
	let new_reply = document.createElement('p');//返答
	new_you.id = "question";
	new_reply.id = "reply"; 
	new_you.textContent = newText;

    let output_not_final = '';
    if (event.results[event.resultIndex].isFinal) { // 結果が確定（Final）のとき
	    asr.abort(); // 音声認識を停止
			
	    let transcript = event.results[event.resultIndex][0].transcript; // 結果文字列

		let output_not_final = '';
		if (event.results[event.resultIndex].isFinal) { // 結果が確定（Final）のとき
			asr.abort(); // 音声認識を停止
			let ret = response[transcript];

			let answer;
			let webpage;
			
			if(typeof ret == 'undefined'){
				answer = "ごめん、なんて？";
			}else{
				answer = ret[0];
				webpage = ret[1];
			}

			let keys = Object.keys(response);
			keys.forEach(function(key) {
				let flag = true;
				key.split(',').forEach(function(word) {
					let pattern = new RegExp(word);
					let flag_test = pattern.test(transcript);
					flag = flag && flag_test;
				});
				if(flag){
					answerAll = response[key];
					answer = answerAll[0]
					webpage = answerAll[1]
					console.log(key + " : " + answer);
				}
			});
		
			output += transcript + ' => ' + answer + '<br>';
				
			tts.text = answer;
			
			new_reply.textContent = answer;
			textbox_element.appendChild(new_you);
			textbox_element.appendChild(new_reply);
			// 再生が終了（end）ときのイベントハンドラ（終了したときに実行される）
			tts.onend = function(event){
				if(typeof webpage != 'undefined'){
					location.href = webpage; // ページを移動
				}   
				asr.start(); // 音声認識を再開 
			}
			
			speechSynthesis.speak(tts); // 再生
				
			
		} else { // 結果がまだ未確定のとき
			output_not_final = '<span style="color:#ddd;">' + transcript + '</span>';
		}
	}
}

// 開始ボタンのイベントハンドラ
startButton.addEventListener('click', function() {
    asr.start();
})

// 停止ボタンのイベントハンドラ
stopButton.addEventListener('click', function() {
    asr.stop();
})
