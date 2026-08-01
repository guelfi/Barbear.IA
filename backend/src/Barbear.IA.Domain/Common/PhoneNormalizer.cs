using System.Text.RegularExpressions;

namespace Barbear.IA.Domain.Common;

public static partial class PhoneNormalizer
{
    /// <summary>
    /// Normaliza telefone BR para E.164 (+55...). Retorna null se inválido.
    /// </summary>
    public static string? ToE164Br(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        var digits = DigitsOnly().Replace(raw, string.Empty);
        if (digits.StartsWith('0'))
        {
            digits = digits.TrimStart('0');
        }

        if (digits.StartsWith("55") && digits.Length is >= 12 and <= 13)
        {
            return $"+{digits}";
        }

        if (digits.Length is 10 or 11)
        {
            return $"+55{digits}";
        }

        return null;
    }

    [GeneratedRegex(@"\D")]
    private static partial Regex DigitsOnly();
}
