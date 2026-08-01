using Barbear.IA.Domain.Common;

namespace Barbear.IA.UnitTests;

public class PhoneNormalizerTests
{
    [Theory]
    [InlineData("(11) 98888-7777", "+5511988887777")]
    [InlineData("11988887777", "+5511988887777")]
    [InlineData("+55 11 98888-7777", "+5511988887777")]
    [InlineData("5511988887777", "+5511988887777")]
    public void ToE164Br_NormalizesBrazilianPhones(string input, string expected)
    {
        Assert.Equal(expected, PhoneNormalizer.ToE164Br(input));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("123")]
    [InlineData("abc")]
    public void ToE164Br_ReturnsNull_WhenInvalid(string? input)
    {
        Assert.Null(PhoneNormalizer.ToE164Br(input));
    }
}
