<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>
<style>
.el-form--inline {
  .el-form-item {
    .el-input,
    .el-cascader,
    .el-select,
    .el-date-editor,
    .el-autocomplete {
      width: 240px;
    }
  }
}
</style>
