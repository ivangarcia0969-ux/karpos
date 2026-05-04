{{- define "karpos.fullname" -}}
{{- printf "%s" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "karpos.labels" -}}
app.kubernetes.io/name: karpos
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
karpos.environment: {{ .Values.environment | quote }}
{{- end -}}

{{- define "karpos.image" -}}
{{- $registry := .Values.image.registry | trimSuffix "/" -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry .image .Values.image.tag -}}
{{- else -}}
{{- printf "%s:%s" .image .Values.image.tag -}}
{{- end -}}
{{- end -}}
