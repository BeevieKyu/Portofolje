from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0021_exhibitorapplication_message_required'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exhibitorapplication',
            name='postal_code_city',
        ),
        migrations.AddField(
            model_name='exhibitorapplication',
            name='postal_code',
            field=models.CharField(default='', max_length=10, verbose_name='Postnummer'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='exhibitorapplication',
            name='city',
            field=models.CharField(default='', max_length=100, verbose_name='Poststed'),
            preserve_default=False,
        ),
    ]
