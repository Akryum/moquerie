import type { ScriptRunReport } from '@moquerie/core'

export function useRunScript() {
  const toast = useToast()

  const reports = useSessionStorage('moquerie.scripts.reports', {} as Record<string, ScriptRunReport[]>)

  async function run(id: string) {
    try {
      const report = await $fetch(`/api/scripts/${id}/run`, {
        method: 'POST',
      })

      if (report.error) {
        toast.add({
          id: 'snapshot-error',
          title: 'Error',
          description: report.error.message,
          icon: 'i-ph-x-circle',
          color: 'red',
        })
      }
      else {
        toast.add({
          title: `Script ${id} ran successfully`,
          icon: 'i-ph-check-circle',
          color: 'green',
        })
      }
      addReport(id, report)
      return report
    }
    catch (e: any) {
      toast.add({
        id: 'snapshot-error',
        title: 'Error',
        description: e.data?.message ?? e.message,
        icon: 'i-ph-x-circle',
        color: 'red',
      })
    }
  }

  function addReport(scriptId: string, report: ScriptRunReport) {
    reports.value = {
      ...reports.value,
      [scriptId]: [
        report,
        ...(reports.value[scriptId] || []),
      ],
    }
  }

  return {
    run,
    reports,
  }
}
