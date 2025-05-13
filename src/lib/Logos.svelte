<script lang="ts">
  import dacredit from "@/assets/da-credit.png";
  import sda from "@/assets/sda-credit.png";
  import ion from "@/assets/ion-credit.png";
  import kst from "@/assets/katalystlogo.png";

  function openLink(event: MouseEvent) {
    const target = event.target as HTMLImageElement;
    if (target.tagName === "IMG" && target.alt) {
      window.open(target.alt, "_blank");
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      openLink(event as unknown as MouseEvent);
    }
  }
</script>

<div
  class="flex gap-2 items-end h-7"
  on:click={openLink}
  on:keypress={handleKeyPress}
  role="button"
  tabindex="0">
  <div class="flex flex-col pt-2">
    <img class="h-16 w-auto" src={kst} alt="https://katalystspace.com/" />
  </div>
  <div class="rounded border bg-white p-1 mb-[1px]">
    <img class="h-14" src={sda} alt="https://sdataplab.org/" />
  </div>
  <div class="flex flex-col pt-2">
    <img class="h-8" src={dacredit} alt="https://digitalarsenal.io" />
    <img class="h-8" src={ion} alt="https://cesium.com" />
  </div>
</div>
