from django.db import models


class SiteSettings(models.Model):
    hero_title = models.CharField(
        'Hovedoverskrift (forside)', max_length=200, default='Chitra')
    hero_subtitle = models.TextField(
        'Undertekst (forside)', blank=True, default='')
    footer_cta_title = models.CharField(
        'Overskrift (footer)', max_length=200, default='Ta kontakt')
    footer_cta_text = models.TextField(
        'Tekst (footer)', blank=True, default='')
    contact_person = models.CharField('Kontaktperson', max_length=100, blank=True, default='')
    contact_email = models.EmailField('Kontakt e-post', blank=True, default='')
    contact_phone = models.CharField('Kontakt telefon', max_length=30, blank=True, default='')
    org_number = models.CharField('Org.nr', max_length=20, blank=True, default='')

    class Meta:
        verbose_name = 'Nettstedinnstillinger'
        verbose_name_plural = 'Nettstedinnstillinger'

    def __str__(self):
        return 'Nettstedinnstillinger'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class ContactMessageQuerySet(models.QuerySet):
    def inbox(self):
        return self.filter(is_spam=False)

    def spam(self):
        return self.filter(is_spam=True)


class ContactMessage(models.Model):
    name = models.CharField('Navn', max_length=100)
    email = models.EmailField('E-post')
    phone = models.CharField('Telefonnummer', max_length=30)
    message = models.TextField('Melding')
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField('IP-adresse', null=True, blank=True)
    is_spam = models.BooleanField('Markert som spam', default=False)
    spam_reason = models.CharField('Årsak', max_length=200, blank=True)
    is_read = models.BooleanField('Lest', default=False)

    objects = ContactMessageQuerySet.as_manager()

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Henvendelse'
        verbose_name_plural = 'Henvendelser'

    def __str__(self):
        return f'{self.name} ({self.email})'
