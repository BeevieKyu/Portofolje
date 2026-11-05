from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0019_exhibitorapplication_field_set'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exhibitorapplication',
            name='event',
            field=models.CharField(choices=[('elverumsdagene', 'Elverumsdagene – 7.–9. august 2026'), ('grundsetmartn', "Grundsetmart'n – 12.–14. mars 2027")], max_length=20, verbose_name='Jeg ønsker å melde meg på'),
        ),
    ]
