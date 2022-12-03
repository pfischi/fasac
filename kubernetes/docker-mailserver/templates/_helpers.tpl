{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{define "dockermailserver.name"}}{{default "dockermailserver" .Values.nameOverride | trunc 63 | trimSuffix "-" }}{{end}}

{{/*
Create a default fully qualified app name.
{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "dockermailserver.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Provide a pre-defined claim or a claim based on the Release
*/}}
{{- define "dockermailserver.pvcName" -}}
{{- if .Values.persistence.existingClaim }}
{{- .Values.persistence.existingClaim }}
{{- else -}}
{{- template "dockermailserver.fullname" . }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the controller service account to use
*/}}
{{- define "dockermailserver.serviceAccountName" -}}
    {{ default "docker-mailserver" }}
{{- end -}}


{{/*
Create the name of the controller service account to use
*/}}
{{- define "dockermailserver.rainloop.serviceAccountName" -}}
{{- if .Values.rainloop.serviceAccount.create -}}
    {{ default (include "dockermailserver.fullname" .) .Values.rainloop.serviceAccount.name }}
{{- else -}}
    {{ default "rainloop" .Values.rainloop.serviceAccount.name }}
{{- end -}}
{{- end -}}
