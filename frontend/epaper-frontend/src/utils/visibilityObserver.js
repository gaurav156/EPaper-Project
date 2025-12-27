let observer;
const callbacks = new Map();

export function observe(element, callback) {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const cb = callbacks.get(entry.target);
            if (cb) {
              cb();
              callbacks.delete(entry.target);
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { rootMargin: "150px" }
    );
  }

  callbacks.set(element, callback);
  observer.observe(element);
}

export function unobserve(element) {
  if (!observer) return;
  callbacks.delete(element);
  observer.unobserve(element);
}