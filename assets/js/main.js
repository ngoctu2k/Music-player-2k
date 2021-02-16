import { song } from '../music/data-music.js';
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
var cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist');
const USER = 'Ông_Chủ_Kim_2k'
var arrRandom = [];
const app = {
    song: song,
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(USER)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        JSON.parse(localStorage.setItem(USER, JSON.stringify(this.config)))

    },
    render: function() {
        console.log('aaa');
        var listSong = this.song;
        var htmls = listSong.map((e, index) => {
            return `
            <div class="song ${this.currentIndex == index ?'active':""}" data-index = ${index}>
            <div class="thumb" style="background-image: url('${e.image}')">
            </div>
            <div class="body">
                <h3 class="title">${e.name}</h3>
                <p class="author">${e.single}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>
            `
        })
        $('.playlist').innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.song[this.currentIndex];
            }
        })
    },
    handleEvent: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        document.onscroll = function() {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const newcdWidth = cdWidth - scrollTop;
                cd.style.width = newcdWidth > 0 ? newcdWidth + 'px' : 0;
                cd.style.opacity = newcdWidth / cdWidth;
            }
            //
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10s
            iterations: Infinity
        })
        cdThumbAnimate.pause();
        console.log(cdThumbAnimate);
        //
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
                if (_this.isRandom && arrRandom.indexOf(+_this.currentIndex) == -1) {
                    arrRandom.push(+_this.currentIndex)
                }
            }
        }
        audio.onplay = function() {
            _this.isPlaying = true;
            $('.player').classList.add('playing');
            cdThumbAnimate.play();

        }
        audio.onended = function() {
            console.log(_this.isRepeat);
            if (_this.isRepeat) {
                console.log('repeat');
                playBtn.click();
            } else {
                nextBtn.click();
            }
        }
        audio.onpause = function() {
            _this.isPlaying = false;
            $('.player').classList.remove('playing');
            cdThumbAnimate.pause();
        }
        audio.ontimeupdate = function() {
                if (audio.duration) {
                    const currentTimePersent = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = currentTimePersent;
                }
            }
            //
        progress.onchange = function() {
                const currentTimePersent = progress.value;
                console.log(currentTimePersent);
                audio.currentTime = audio.duration / 100 * currentTimePersent;
            }
            //
        const nextBtn = $('.btn-next');
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.random();
            } else {
                _this.next();
            }
            audio.play();
        }
        const prevBtn = $('.btn-prev');
        prevBtn.onclick = function() {
                if (_this.isRandom) {
                    _this.random()
                } else {
                    _this.prev()
                }
                audio.play();
            }
            //
        randomBtn.onclick = function() {
                randomBtn.classList.toggle('active');
                _this.isRandom = !_this.isRandom;
                if (_this.isRandom && arrRandom.indexOf(+_this.currentIndex) == -1) {
                    arrRandom.push(+_this.currentIndex)
                }
                _this.setConfig("random", _this.isRandom)
            }
            //
        repeatBtn.onclick = function() {
                repeatBtn.classList.toggle('active');
                _this.isRepeat = !_this.isRepeat;
                _this.setConfig("repeat", _this.isRepeat)
            }
            //
        playlist.onclick = function(e) {
            if (e.target.closest('.song:not(.active)') || e.target.closest('.option')) {
                if (e.target.closest('.song:not(.active)')) {
                    _this.currentIndex = e.target.closest('.song:not(.active)').dataset.index;
                    _this.loadCurrentSong();
                    _this.active();
                    audio.play();
                }
                if (e.target.closest('.option')) {}
            }
        }
    },
    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name;
        cdThumb.style.background = `url("${this.currentSong.image}")`;
        audio.src = this.currentSong.path;

    },
    loadConfig: function() {
        this.isRandom = this.config.random;
        this.isRepeat = this.config.repeat;
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);
    },
    next: function() {
        this.currentIndex++
            if (this.currentIndex >= this.song.length) {
                this.currentIndex = 0;
            }
        this.loadCurrentSong();
        this.active();
    },
    prev: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.song.length - 1;
        }
        this.loadCurrentSong()
        this.active();
    },

    random: function() {
        let randomIndex;
        if (arrRandom.length >= this.song.length) {
            arrRandom = [];
        }
        do {
            randomIndex = Math.floor(Math.random() * this.song.length)

        } while ((this.currentIndex == randomIndex));
        if (arrRandom.indexOf(randomIndex) == -1) {
            this.currentIndex = randomIndex;
            arrRandom.push(this.currentIndex);
            console.log(arrRandom, 'aaa');
            this.loadCurrentSong();
            this.active();
        } else {
            this.random();
        }

    },
    active: function() {
        let allSong = $$('.song');
        console.log(allSong);
        allSong.forEach((e, i) => {
            e.classList.remove('active')
            if (i == this.currentIndex) {
                e.classList.add('active')
            }
        });
        this.scrollActiveSong();
    },
    scrollActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest"
            })
        }, 300)
    },
    start: function() {
        this.loadConfig();
        this.defineProperties();
        this.handleEvent();
        this.loadCurrentSong();
        this.render();
    }
}
app.start();