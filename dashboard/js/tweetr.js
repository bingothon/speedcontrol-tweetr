const speedcontrolBundle = 'nodecg-speedcontrol';
const runDataActiveRun = nodecg.Replicant('runDataActiveRun', speedcontrolBundle);
const runDataArray = nodecg.Replicant('runDataArray', speedcontrolBundle);
const tweetData = nodecg.Replicant('tweetData');
// const mediaData = nodecg.Replicant('assets:media')
const selectedRunId = nodecg.Replicant('selectedRunId');
const countdownTimer = nodecg.Replicant('countdownTimer');

NodeCG.waitForReplicants(runDataActiveRun, runDataArray, tweetData, selectedRunId, countdownTimer).then(() => {
	const enableCb = document.getElementById('enableCb');

	runDataArray.on('change', (newVal) => populateDropdown(newVal));
	//runDataActiveRun.on('change', (newVal) => startCountdown(newVal));
	selectedRunId.on('change', (newVal) => updateDropdown(newVal));
	tweetData.on('change', () => updatePreview());

	countdownTimer.on('change', (newVal) => {
		if (newVal.countdownActive){
			updateCountdown(newVal);
		} else if (newVal.sendTweet) {
			sendTweet();
		} else if (newVal.cancelTweet) {
			cancelTweet();
		}

		if (newVal.twEnabled) {
			enableCb.checked = true;
		}
	});

	enableCb.addEventListener('change', () => {
		toggleEnabled(enableCb.hasAttribute('checked'));
	});

	updateDropdown(selectedRunId.value);

	if (countdownTimer.value.sendTweet) {
		sendTweet();
	} else if (countdownTimer.value.cancelTweet) {
		cancelTweet();
	}
});

function populateDropdown(data) {
	let dropdownContent = document.getElementById('runList');
	dropdownContent.innerHTML = '';
	data.forEach(run => {
		let paperItem = document.createElement('paper-item');
		paperItem.innerHTML = run.game;
		paperItem.setAttribute('id', run.id);
		dropdownContent.appendChild(paperItem);
	});
}

function updateCountdown(newVal) {
	const enableCb = document.getElementById('enableCb');
	let tweetButton = document.getElementById('sendTweet');
	let cancelButton = document.getElementById('cancelTweet');

	enableCb.disabled = true;
	tweetButton.disabled = false;
	cancelButton.disabled = false;
	tweetButton.innerHTML = `Tweeting in ${newVal.countdown}s`;
}

function updateSendTweet() {
	if (!countdownTimer.value.twEnabled) {
		return;
	}

	if (countdownTimer.value.sendTweet) {
		countdownTimer.value.sendTweet = false;
	}
	countdownTimer.value.countdownActive = false;
	countdownTimer.value.countdown = -1;
	countdownTimer.value.sendTweet = true;
}

function sendTweet() {
	const enableCb = document.getElementById('enableCb');
	let tweetButton = document.getElementById('sendTweet');
	let cancelButton = document.getElementById('cancelTweet');

	enableCb.disabled = false;
	cancelButton.disabled = true;
	tweetButton.disabled = true;
	tweetButton.innerHTML = 'Tweet Sent';
}

function cancelTweet() {
	const enableCb = document.getElementById('enableCb');
	let tweetButton = document.getElementById('sendTweet');
	let cancelButton = document.getElementById('cancelTweet');
	enableCb.disabled = false;
	cancelButton.disabled = true;
	tweetButton.innerHTML = 'Tweet';
}

function changeSelectedRun(id) {
	selectedRunId.value = id;
}

function updateDropdown(runId) {
	document.getElementById('sendTweet').disabled = false;
	document.getElementById('sendTweet').innerHTML = 'Tweet';
	let dropdownContent = document.getElementById('runList').items;
	for (let i = 0; i < dropdownContent.length; i++) {
		if (dropdownContent[i].id === runId) {
			document.getElementById('runList').selectIndex(i);
			break;
		}
	}

	updatePreview();
}

function toggleEnabled(value) {
	const tweetButton = document.getElementById('sendTweet');
	const cancelButton = document.getElementById('cancelTweet');

	countdownTimer.value.twEnabled = value;

	if (value) {
		cancelTweet();
		tweetButton.disabled = false;
		updatePreview();
	} else {
		tweetButton.disabled = true;
		cancelButton.disabled = true;
		countdownTimer.value.cancelTweet = true;
	}
}

function openEditDialog() {
	countdownTimer.value.cancelTweet = true;
	nodecg.getDialog('edit-tweet').open(true); // TODO: find documentation
}

function updatePreview() {
	document.getElementById('contentPreview').value = tweetData.value[selectedRunId.value].content;
	document.getElementById('mediaPreview').value = tweetData.value[selectedRunId.value].media;
}
