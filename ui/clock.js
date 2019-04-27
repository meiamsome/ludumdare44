class UIClock {
  draw() {
    stroke(0);
    fill(255);
    textSize(40);
    textAlign(CENTER, TOP);
    const timeToEnd = max(endTime - Date.now(), 0);
    const millis = timeToEnd % 1000;
    let next = (timeToEnd - millis) / 1000;
    const seconds = next % 60;
    next = (next - seconds) / 60;
    const minutes = next;
    text(`${nf(minutes, 2)}:${nf(seconds, 2)}`, width/2, 20);
    textSize(16);
    textAlign(LEFT, TOP);
    text(nf(millis, 3), width/2 + 60, 36);
  }
}
