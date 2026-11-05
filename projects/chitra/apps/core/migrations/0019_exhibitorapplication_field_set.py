from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_exhibitorapplication'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exhibitorapplication',
            name='category',
        ),
        migrations.AddField(
            model_name='exhibitorapplication',
            name='website',
            field=models.CharField(blank=True, max_length=200, verbose_name='Nettside'),
        ),
        migrations.AddField(
            model_name='exhibitorapplication',
            name='address',
            field=models.CharField(default='', max_length=200, verbose_name='Adresse'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='exhibitorapplication',
            name='postal_code_city',
            field=models.CharField(default='', max_length=100, verbose_name='Postnummer og poststed'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='exhibitorapplication',
            name='event',
            field=models.CharField(blank=True, choices=[('elverumsdagene', 'Elverumsdagene – 7.–9. august 2026'), ('grundsetmartn', "Grundsetmart'n – 12.–14. mars 2027")], max_length=20, verbose_name='Jeg ønsker å melde meg på'),
        ),
        migrations.AddField(
            model_name='exhibitorapplication',
            name='accepted_rules',
            field=models.BooleanField(default=False, verbose_name='Har lest reglementet og bekrefter deltakelse'),
        ),
        migrations.AlterField(
            model_name='exhibitorapplication',
            name='company_name',
            field=models.CharField(max_length=150, verbose_name='Utstiller'),
        ),
        migrations.AlterField(
            model_name='exhibitorapplication',
            name='org_number',
            field=models.CharField(max_length=20, verbose_name='Foretaksnummer'),
        ),
        migrations.AlterField(
            model_name='exhibitorapplication',
            name='message',
            field=models.TextField(blank=True, verbose_name='Hva skal markedsføres og selges'),
        ),
        migrations.AlterField(
            model_name='exhibitorapplication',
            name='stand_size',
            field=models.CharField(choices=[('3x3', '3x3m (9 m²)'), ('3x6', '3x6m (18 m²)'), ('3x9', '3x9m (27 m²)'), ('3x12', '3x12m (36 m²)'), ('over36', '> 36 m²'), ('apen', 'Åpen stand (ute)')], max_length=20, verbose_name='Ønsket standstørrelse'),
        ),
        migrations.AlterModelOptions(
            name='exhibitorapplication',
            options={'ordering': ['-created_at'], 'verbose_name': 'Utstillerpåmelding', 'verbose_name_plural': 'Utstillerpåmeldinger'},
        ),
    ]
