<script lang="ts">
  import {
    groups,
    modifyGroup,
    activeGroup,
  } from "@/stores/spacecatalog.group.store"; // Update the path
  import { content, lastcontent } from "@/stores/modal.store";
  import CloseButton from "@/lib/elements/CloseButton.svelte";
  import Groups from "./Groups.svelte";
  let name = "";
  let description = "";

  const closeModal: any = (event: any, component?: any) => {
    $content = $lastcontent || component || undefined;
    $lastcontent = undefined;
  };

  const addNewGroup = async () => {
    const gID = await modifyGroup(name, description);
    $activeGroup = gID;
    $groups["defaultGroup"].filterObject = {};
    $content = Groups;
  };
</script>

<div
  class="fixed right-0 mt-12 pr-2 pl-2 flex pointer-events-auto select-none z-50 h-1/2 md:h-1/2 w-full md:w-1/3 max-h-[400px]">
  <!-- Modal content -->
  <div
    style="background:rgba(48, 51, 54, .85)"
    class="bg-opacity-75 text-white rounded shadow-xl w-full h-full overflow-auto flex flex-col border border-gray-600">
    <!-- Modal header -->
    <div class="flex-none text-md md:text-xl">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="flex justify-between items-center pl-4 pr-3 pt-2 pb-2 md:pt-2 md:pb-2 border-b border-gray-600">
        <p class="text-white font-[300]">Add Group</p>
        <CloseButton onclick={closeModal} />
      </div>
    </div>
    <!-- Modal body -->
    <form
      class="flex flex-col space-y-4 items-center justify-center p-4"
      on:submit|preventDefault={addNewGroup}>
      <div class="w-full pl-3 pr-3 max-w-[256px]">
        <label for="name" class="block text-sm font-medium">Group Name</label>
        <input
          type="text"
          id="name"
          class="w-full bg-white text-black mt-1 block border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          bind:value={name}
          required />
      </div>
      <div class="w-full pl-3 pr-3 max-w-[256px]">
        <label for="description" class="block text-sm font-medium"
          >Description (Optional)</label>
        <textarea
          id="description"
          rows="3"
          class="w-full bg-white text-black mt-1 block border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
          bind:value={description} />
      </div>
      <button
        type="submit"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm rounded bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >Add Group</button>
    </form>
  </div>
</div>
