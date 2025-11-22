<script>
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { Button } from "$lib/components/ui/button";
  let { playerObj } = $props();

  // map input value to a colour
  function color(n) {
    const normalized = (n + 1500) / (2000 + 1500); // (-1500, 2000) is the range
    const r = Math.floor(255 * (1 - normalized)); // Red colour slider
    const g = Math.floor(255 * normalized); // Green colour slider
    return `rgb(${r}, ${g}, 0)`;
  }

  let formatName = (full) => `${full[0]}. ${full.split(" ")[1]}`;
</script>

<div class="my-1">
  <ButtonGroup.Root>
    <Button size="sm" variant="outline"
      >{formatName(playerObj.player.name)}</Button
    >
    <Button size="sm" variant="outline">{playerObj.redraftValue}</Button>
    <Button
      size="sm"
      variant="outline"
      style="background: {color(playerObj.trend30Day)};"
      >{playerObj.trend30Day}</Button
    >
  </ButtonGroup.Root>
</div>
