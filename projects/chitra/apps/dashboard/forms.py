from django import forms

from apps.core.models import SiteSettings


class SiteSettingsForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = [
            'hero_title', 'hero_subtitle',
            'footer_cta_title', 'footer_cta_text',
            'contact_person', 'contact_email', 'contact_phone', 'org_number',
        ]
        widgets = {
            'hero_title': forms.TextInput(attrs={'class': 'dash-input'}),
            'hero_subtitle': forms.Textarea(attrs={'class': 'dash-textarea', 'rows': 3}),
            'footer_cta_title': forms.TextInput(attrs={'class': 'dash-input'}),
            'footer_cta_text': forms.Textarea(attrs={'class': 'dash-textarea', 'rows': 3}),
            'contact_person': forms.TextInput(attrs={'class': 'dash-input'}),
            'contact_email': forms.EmailInput(attrs={'class': 'dash-input'}),
            'contact_phone': forms.TextInput(attrs={'class': 'dash-input'}),
            'org_number': forms.TextInput(attrs={'class': 'dash-input'}),
        }
