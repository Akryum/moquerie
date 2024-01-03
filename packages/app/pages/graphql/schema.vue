<script lang="ts" setup>
const { data, error, refresh } = await useFetch('/api/graphql/schema/inspect')
onWindowFocus(refresh)

useHead({
  title: 'Schema',
})
</script>

<template>
  <KeepAlive>
    <ErrorMessage v-if="error" :error="error" class="p-12" />
    <UTabs
      v-else
      :items="[
        {
          slot: 'schema',
          label: 'Schema',
        },
        {
          slot: 'introspection',
          label: 'Introspection',
        },
      ]"
      :ui="{
        wrapper: 'h-full flex flex-col pt-2 dark:bg-gray-900',
        container: 'h-full',
        base: 'h-full',
        list: {
          base: 'w-max mx-auto h-10 border border-transparent dark:border-gray-900',
          tab: {
            height: 'h-full',
          },
        },
      }"
    >
      <template #schema>
        <MonacoEditor
          filename="schema.gql"
          :source="data?.schema ?? ''"
          :options="{
            language: 'graphql',
            readOnly: true,
          }"
          class="h-full"
        />
      </template>

      <template #introspection>
        <MonacoEditor
          filename="schema.graphql.json"
          :source="JSON.stringify(data?.introspection, null, 2)"
          :options="{
            language: 'json',
            readOnly: true,
          }"
          class="h-full"
        />
      </template>
    </UTabs>
  </KeepAlive>
</template>
