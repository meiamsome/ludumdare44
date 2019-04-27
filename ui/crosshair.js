class UICrosshair {
  draw() {
    stroke(255);
    line(mouseX, mouseY + 10, mouseX, mouseY + 20);
    line(mouseX, mouseY - 10, mouseX, mouseY - 20);
    line(mouseX + 10, mouseY, mouseX + 20, mouseY);
    line(mouseX - 10, mouseY, mouseX - 20, mouseY);
  }
}
