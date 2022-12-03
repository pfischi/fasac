{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{define "metasploit.name"}}{{default "metasploit" .Values.nameOverride | trunc 63 | trimSuffix "-" }}{{end}}

{{/*
Create a default fully qualified app name.
{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "metasploit.fullname" -}}
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
{{- define "metasploit.pvcName" -}}
{{- if .Values.persistence.existingClaim }}
{{- .Values.persistence.existingClaim }}
{{- else -}}
{{- template "metasploit.fullname" . }}
{{- end -}}
{{- end -}}

{{/*
Create the name of the controller service account to use
*/}}
{{- define "metasploit.serviceAccountName" -}}
    {{ default "metasploit" }}
{{- end -}}