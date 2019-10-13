/**
 * @author Jon Garcia <jongarcia@sans.org>
 */
import { inlineWorker } from './helpers';

export class ImageCompression {
    constructor(img) {
        this.img = img;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.img.width;
        this.canvas.height = this.img.height;

        this.process1 = this.process1.bind(this);
        this.process2 = this.process2.bind(this);
    }

    // returns a function that calculates lanczos weight
    lanczosCreate(lobes) {
        return function (x) {
            if (x > lobes) {
                return 0;
            }
            x *= Math.PI;
            if (Math.abs(x) < 1e-16) {
                return 1;
            }
            const xx = x / lobes;
            return Math.sin(x) * Math.sin(xx) / x / xx;
        };
    }

    // canvas: canvas element, img: image element, sx: scaled width, lobes: kernel radius
    lanczosCompress(width, lobes) {
        return new Promise((resolve, reject) => {
            try {
                this.resolve = resolve;
                this.canvas.style.display = 'none';
                this.ctx = this.canvas.getContext('2d');
                this.ctx.drawImage(this.img, 0, 0);
                this.src = this.ctx.getImageData(0, 0, this.img.width, this.img.height);
                this.dest = {
                    width,
                    height: Math.round(this.img.height * width / this.img.width),
                };
                this.dest.data = new Array(this.dest.width * this.dest.height * 3);
                this.lanczos = this.lanczosCreate(lobes);
                this.ratio = this.img.width / width;
                this.rcp_ratio = 2 / this.ratio;
                this.range2 = Math.ceil(this.ratio * lobes / 2);
                this.cacheLanc = {};
                this.center = {};
                this.icenter = {};
                setTimeout(this.process1, 0, 0);
            } catch (e) {
                reject(e);
            }
        });
    }

    hermiteCompress(targetWith) {
        return new Promise((resolve, reject) => {
            try {
                targetWith = Math.round(targetWith);
                const imgWidth = this.img.width;
                const imgHeight = this.img.height;
                this.canvas.width = imgWidth;
                this.canvas.height = imgHeight;
                const ctx = this.canvas.getContext('2d');
                const targetHeight = Math.round(this.img.height * targetWith / this.img.width);
                ctx.drawImage(this.img, 0, 0);

                const img = this.canvas.getContext('2d').getImageData(0, 0, imgWidth, imgHeight);
                const img2 = this.canvas.getContext('2d').getImageData(0, 0, targetWith, targetHeight);
                const worker = inlineWorker(this.hermiteWorker);
                if (worker) {
                    worker.onmessage = ({ data }) => {
                        this.addToCanvas(data, imgWidth, targetWith, imgHeight, targetHeight, resolve);
                        worker.terminate();
                    };
                    worker.postMessage({ img, img2, targetWith, targetHeight, imgWidth, imgHeight });
                } else {
                    this.hermiteWorker({ img, img2, targetWith, targetHeight, imgWidth, imgHeight });
                    this.addToCanvas(img2, imgWidth, targetWith, imgHeight, targetHeight, resolve);
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    addToCanvas(data, imgWidth, targetWith, imgHeight, targetHeight, resolve) {
        this.canvas.getContext('2d').clearRect(
            0,
            0,
            Math.max(imgWidth, targetWith),
            Math.max(imgHeight, targetHeight)
        );
        this.canvas.width = targetWith;
        this.canvas.height = targetHeight;
        this.canvas.getContext('2d').putImageData(data, 0, 0);
        resolve(this.canvas);
    }

    hermiteWorker({ data }) {
        const { img, img2, targetWith, targetHeight, imgWidth, imgHeight } = data;
        const imgData = img.data;
        const imgData2 = img2.data;
        const ratio_w = imgWidth / targetWith;
        const ratio_h = imgHeight / targetHeight;
        const ratio_w_half = Math.ceil(ratio_w / 2);
        const ratio_h_half = Math.ceil(ratio_h / 2);

        for (let j = 0; j < targetHeight; j++) {
            for (let i = 0; i < targetWith; i++) {
                const x2 = (i + j * targetWith) * 4;
                let weight = 0;
                let weights = 0;
                let weights_alpha = 0;
                let gx_r = 0;
                let gx_g = 0;
                let gx_b = 0;
                let gx_a = 0;
                const center_y = (j + 0.5) * ratio_h;
                for (let yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++) {
                    const dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                    const center_x = (i + 0.5) * ratio_w;
                    const w0 = dy * dy; //pre-calc part of w
                    for (let xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++) {
                        let dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                        const w = Math.sqrt(w0 + dx * dx);
                        if (w >= -1 && w <= 1) {
                            //hermite filter
                            weight = 2 * w * w * w - 3 * w * w + 1;
                            if (weight > 0) {
                                dx = 4 * (xx + yy * imgWidth);
                                //alpha
                                gx_a += weight * imgData[dx + 3];
                                weights_alpha += weight;
                                //colors
                                if (imgData[dx + 3] < 255) {
                                    weight = weight * imgData[dx + 3] / 250;
                                }
                                gx_r += weight * imgData[dx];
                                gx_g += weight * imgData[dx + 1];
                                gx_b += weight * imgData[dx + 2];
                                weights += weight;
                            }
                        }
                    }
                }
                imgData2[x2] = gx_r / weights;
                imgData2[x2 + 1] = gx_g / weights;
                imgData2[x2 + 2] = gx_b / weights;
                imgData2[x2 + 3] = gx_a / weights_alpha;
            }
        }
        self.postMessage(img2);
    }

    process1(u) {
        this.center.x = (u + 0.5) * this.ratio;
        this.icenter.x = Math.floor(this.center.x);
        for (let v = 0; v < this.dest.height; v++) {
            this.center.y = (v + 0.5) * this.ratio;
            this.icenter.y = Math.floor(this.center.y);
            let a;
            let b;
            let g;
            let r;
            a = r = g = b = 0;
            for (let i = this.icenter.x - this.range2; i <= this.icenter.x + this.range2; i++) {
                if (i < 0 || i >= this.src.width) {
                    continue;
                }
                const f_x = Math.floor(1000 * Math.abs(i - this.center.x));
                if (!this.cacheLanc[f_x]) {
                    this.cacheLanc[f_x] = {};
                }
                for (let j = this.icenter.y - this.range2; j <= this.icenter.y + this.range2; j++) {
                    if (j < 0 || j >= this.src.height) {
                        continue;
                    }
                    const f_y = Math.floor(1000 * Math.abs(j - this.center.y));
                    if (typeof this.cacheLanc[f_x][f_y] == 'undefined') {
                        this.cacheLanc[f_x][f_y] = this.lanczos(Math.sqrt(Math.pow(f_x * this.rcp_ratio, 2) +
                            Math.pow(f_y * this.rcp_ratio, 2)) / 1000);
                    }
                    const weight = this.cacheLanc[f_x][f_y];
                    if (weight > 0) {
                        const idx = (j * this.src.width + i) * 4;
                        a += weight;
                        r += weight * this.src.data[idx];
                        g += weight * this.src.data[idx + 1];
                        b += weight * this.src.data[idx + 2];
                    }
                }
            }
            const idx = (v * this.dest.width + u) * 3;
            this.dest.data[idx] = r / a;
            this.dest.data[idx + 1] = g / a;
            this.dest.data[idx + 2] = b / a;
        }

        if (++u < this.dest.width) {
            setTimeout(this.process1, 0, u);
        } else {
            setTimeout(this.process2, 0);
        }
    }

    process2() {
        this.canvas.width = this.dest.width;
        this.canvas.height = this.dest.height;
        this.ctx.drawImage(this.img, 0, 0, this.dest.width, this.dest.height);
        this.src = this.ctx.getImageData(0, 0, this.dest.width, this.dest.height);
        let idx;
        let idx2;
        for (let i = 0; i < this.dest.width; i++) {
            for (let j = 0; j < this.dest.height; j++) {
                idx = (j * this.dest.width + i) * 3;
                idx2 = (j * this.dest.width + i) * 4;
                this.src.data[idx2] = this.dest.data[idx];
                this.src.data[idx2 + 1] = this.dest.data[idx + 1];
                this.src.data[idx2 + 2] = this.dest.data[idx + 2];
            }
        }
        this.ctx.putImageData(this.src, 0, 0);
        this.canvas.style.display = 'block';
        this.resolve(this.canvas);
    }
}
