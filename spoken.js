const URL = "https://jlp.yahooapis.jp/NLUService/V2/analyze?appid="; // APIのリクエストURL
const APPID = "dj00aiZpPUhFdWJ2ZlhaclVPYSZzPWNvbnN1bWVyc2VjcmV0Jng9ODc-"; // あなたのアプリケーションID
const queryURL = URL + APPID;

let date = new Date();

var response = {
    "誰":["ななしのパンダ、です","undefined"],
    "何歳":["7歳です、パンダの1歳はヒトでいうと３歳らしい、です","undefined"],
	"こんにちは":["こんにちは","undefined"],
	"おはよう":["おはようー","undefined"],
    "好き,食べ物":["ササよりタケノコがスキ、です","undefined"],
	"好き,飲み物":["ミズです","undefined"],
	"さようなら":["またお話しましょう、です","undefined"],
	"よろしく":["よろしく、です","undefined"],
	"初めまして":["はじめまして、です","undefined"],
	"今,何時":[date.getHours() + "時"　+ date.getMinutes() + "分だと思う、です","undefined"],
	"今,何分":[date.getMinutes() + "分だと思う、です","undefined"],
	"パンダ":["呼びましたか？","undefined"],
	"天気": ["すみません、答えられない、のでこれをみて", "https://tenki.jp/forecast/6/33/6510/30201/10days.html"],
	"パンダ,日本":["ウエノドウブツエンとアドベンチャーワールドに４ヒキずついます、コウベはサイキンいなくなってしまいました、かなしい…","undefined"],
	"アドベンチャーワールド": ["わかやまにあります、しょうかいページあるからみてください","https://www.aws-s.com/animals/panda/"],
	"上野": ["アドベンチャーワールドのほうがすきです、おうえんしてください、でもしかたないのでウエノのサイトをおしえます","https://www.ueno-panda.jp/"]
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
tts.rate = 1.4; // 速度
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

		let answer;
		
		let keys = Object.keys(response);
		keys.forEach(function(key) {
			let flag = true;
			console.log(transcript);
			key.split(',').forEach(function(word) {              
				let pattern = new RegExp(word);
				let flag_test = pattern.test(transcript); // マッチしたらtrue, しなかったらfalse
				flag = flag && flag_test; // 両方trueならtrue
				console.log(pattern + '+' + ':' + flag_test);
				//flag = flag && new RegExp(word).test(transcript);
			});

			if(flag){
				let answerAll = response[key];
				console.log(key + " : " + answer);
				answer = answerAll[0]
				let webpage = answerAll[1]
				tts.text = answer;
				tts.onend = function(event){
					if(typeof webpage != 'undefined'&& webpage!="undefined"){
						location.href = webpage; // ページを移動
					}  
				}
				
				speechSynthesis.speak(tts); // 再生
			}
		});
		
		if(typeof answer == 'undefined'){
			// HTTPリクエストの準備
			var postdata = {
				"id": "1234-1", // JSON-RPC2.0 id、値は任意で、指定した値がレスポンスのidになる。
				"jsonrpc" : "2.0", // APIで固定
				"method" : "jlp.nluservice.analyze", // APIで固定
				"params" : { "q" : transcript }, // 解析対象のテキスト 
			};
			var jsondata = JSON.stringify(postdata);
		
			const request = new XMLHttpRequest();
			request.open('POST', queryURL, true);
			request.setRequestHeader('Content-Type', 'application/json');
			request.responseType = 'json'; // レスポンスはJSON形式に変換

			// HTTPの状態が変化したときのイベントハンドラ
			request.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					// readyState == 4 操作完了
					// status == 200 リクエスト成功（HTTPレスポンス）
						
					let res = this.response; // 結果はJSON形式

					Object.keys(res.result).forEach(function (key) {
						console.log(key + ": " + res.result[key])
					});
				
					// METHOD が SAY のときのみ
					if(res.result.METHOD == "SAY"){
						answer = res.result.PARAM_TEXT_TTS || res.result.PARAM_TEXT　+ "・・・それよりパンダのことをきいてほしい、です";
						new_reply.textContent = answer;
						tts.text= answer;
						speechSynthesis.speak(tts); // 再生
					}else{
						answer = "ごめんなさい、ヒトのコトバ難しくて・・・";
						new_reply.textContent = answer;
						tts.text= answer;
						speechSynthesis.speak(tts); // 再生
					}
				}
			};
			// HTTPリクエストの実行
			request.send(jsondata);
		}

		new_reply.textContent = answer;
		textbox_element.appendChild(new_you);
		textbox_element.appendChild(new_reply);
		
		
		// 再生が終了（end）ときのイベントハンドラ（終了したときに実行される）
		
				
	} else { // 結果がまだ未確定のとき
		output_not_final = '<span style="color:#ddd;">' + transcript + '</span>';
	}
}

// 開始ボタンのイベントハンドラ
startButton.addEventListener('click', function() {
    asr.start();
})

// 停止ボタンのイベントハンドラ
stopButton.addEventListener('click', function() {
    asr.stop();
	asr.abort();
})
