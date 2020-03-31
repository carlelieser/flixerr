import http from "http";

class VideoStream {
	constructor(torrent, file) {
		this.ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
		this.childProcessor = require("child_process");
		this.torrent = torrent;
		this.file = file;
		this.ffmpeg = false;
		this.server = false;

		this.init();
	}

	getFileExtension = file => {
		let { name } = file;
		return name.substring(name.lastIndexOf(".") + 1, name.length);
	};

	setCallback = callback => {
		this.callback = callback;
	};

	shouldBeStreamed = () => {
		let extension = this.getFileExtension(this.file);
		let streamingExtensions = ["mkv", "avi"];
		if (streamingExtensions.indexOf(extension) > -1) return true;
		return false;
	};

	getCurrentFileName = () => {
		let { name } = this.file;
		let convertedName = `${name.substring(0, name.lastIndexOf("."))}.mp4`;

		return convertedName;
	};

	getCurrentFilePath = () => {
		let convertedName = this.getCurrentFileName();
		let convertedPath = `streaming/converted/${convertedName}`;

		return convertedPath;
	};

	setCurrentFile = file => {
		this.file = file;
	};

	setEvents = () => {
		let ffmpeg = this.ffmpeg;

		ffmpeg.stderr.on("data", data => {
			let output = data.toString();
			console.log(output);
		});

		ffmpeg.stderr.on("end", () => {
			console.log("File has been converted successfully!");
		});

		ffmpeg.stderr.on("exit", () => {
			console.log("Child has exited.");
		});

		ffmpeg.stderr.on("close", () => {
			console.log("Conversion exiting.");
		});
	};

	spawnFFmpeg = () => {
		let ffmpegPath = this.ffmpegInstaller.path;
		let spawn = this.childProcessor.spawn;
		this.ffmpeg = spawn(ffmpegPath, [
			"-i",
			"pipe:0",
			"-acodec",
			"aac",
			"-vcodec",
			"h264",
			"-preset",
			"ultrafast",
			"-movflags",
			"frag_keyframe+empty_moov",
			"-f",
			"mp4",
			"pipe:1"
		]);
		this.setEvents();
	};

	handleServer = (req, res) => {
		res.writeHead(200, {
			"Content-Type": "video/mp4"
		});

		let original = this.file.createReadStream();
		this.spawnFFmpeg();

		original.pipe(this.ffmpeg.stdin);
		this.ffmpeg.stdout.pipe(res);

		if (callback) {
			this.callback();
		}
	};

	getServer = () => {
		console.log("Creating server for:", this.file.name);
		let shouldBeStreamed = this.shouldBeStreamed();
		let server = shouldBeStreamed
			? http.createServer(this.handleServer)
			: this.torrent.createServer();
		return server;
	};

	init = () => {
		this.server = this.getServer();
		this.server.listen(8000);
	};

	destroy = () => {
		if (this.ffmpeg) this.ffmpeg.kill();
		this.server.close();
	};
}

export default VideoStream;
