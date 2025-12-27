class ImagePrefetchQueue {
  constructor(limit = 2) {
    this.limit = limit;
    this.active = 0;
    this.queue = [];
  }

  enqueue(src) {
    this.queue.push(src);
    this.run();
  }

  run() {
    if (this.active >= this.limit || !this.queue.length) return;

    const src = this.queue.shift();
    this.active++;

    const img = new Image();
    img.onload = img.onerror = () => {
      this.active--;
      this.run();
    };

    img.src = src;
  }

  clear() {
    this.queue = [];
  }
}

export const imagePrefetchQueue = new ImagePrefetchQueue(2);