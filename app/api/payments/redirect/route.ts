import { NextResponse } from "next/server";
import { processPaymentReturn } from "@/app/(students)/admission/payment/lib/action";

async function handleRedirect(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("paymentId");

    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        const rawBodyText = await req.text();
        console.log("[Redirect API] Raw body text received:", rawBodyText);

        if (rawBodyText) {
          // Attempt to parse as JSON
          try {
            body = JSON.parse(rawBodyText) as Record<string, unknown>;
          } catch {
            // Attempt to parse as url-encoded form data
            try {
              body = Object.fromEntries(
                new URLSearchParams(rawBodyText).entries(),
              ) as Record<string, unknown>;
            } catch (formErr) {
              console.error("[Redirect API] Form parsing failed:", formErr);
            }
          }
        }
      } catch (bodyErr) {
        console.error("[Redirect API] Error reading body text:", bodyErr);
      }
    }

    const rawResponse =
      (body.response as string | undefined) ||
      (body.resp as string | undefined) ||
      url.searchParams.get("response") ||
      url.searchParams.get("resp") ||
      null;

    console.log("[Redirect API] Raw Response received:", {
      hasRawResponse: !!rawResponse,
      paymentId,
      method: req.method,
    });

    if (!rawResponse) {
      console.warn("[Redirect API] Missing response ciphertext");
      if (paymentId) {
        return NextResponse.redirect(
          new URL(`/payment-success?paymentId=${paymentId}`, req.url),
          303,
        );
      }
      return NextResponse.redirect(
        new URL("/payment-success?error=missing_payload", req.url),
        303,
      );
    }

    // Fix spaces that may have replaced + signs during transit
    const responseCiphertext = String(rawResponse).trim().includes(" ")
      ? String(rawResponse).trim().replace(/ /g, "+")
      : String(rawResponse).trim();

    const result = await processPaymentReturn(responseCiphertext);
    console.log("[Redirect API] Processed payment return result:", result);

    const targetPaymentId = paymentId || result.paymentId;
    if (targetPaymentId) {
      return NextResponse.redirect(
        new URL(`/payment-success?paymentId=${targetPaymentId}`, req.url),
        303,
      );
    }

    return NextResponse.redirect(
      new URL("/payment-success?error=invalid_payload", req.url),
      303,
    );
  } catch (error) {
    const err = error as Error;
    console.error("[Redirect API] Error processing return:", err);
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("paymentId");
    if (paymentId) {
      return NextResponse.redirect(
        new URL(
          `/payment-success?paymentId=${paymentId}&error=${encodeURIComponent(
            err.message || "processing_error",
          )}`,
          req.url,
        ),
        303,
      );
    }
    return NextResponse.redirect(
      new URL(
        `/payment-success?error=${encodeURIComponent(err.message || "unknown_error")}`,
        req.url,
      ),
      303,
    );
  }
}

export async function GET(req: Request) {
  return handleRedirect(req);
}

export async function POST(req: Request) {
  return handleRedirect(req);
}
