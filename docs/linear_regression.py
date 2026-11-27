r"""数学建模：一元／多元线性回归（普通最小二乘法）。

依赖安装：
    python -m pip install numpy pandas

运行内置模拟数据示例：
    python docs/linear_regression.py

本机已验证的独立解释器（PowerShell）：
    & "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" docs/linear_regression.py

使用自己的 CSV，第一行为列名，每一行为一个独立样本：
    python docs/linear_regression.py --csv data.csv --target y --features x1 x2

省略 --features 时使用目标列之外的全部列，所有数据应为有限数值且无缺失。
模型形式为 y = 截距 + b1*x1 + ... + bp*xp。训练集用于估计参数，
测试集仅用于评估。随机划分适用于独立样本，时间序列应改用按时间划分。
每次运行创建独立结果目录，保存系数、训练／测试指标和测试集预测结果。
"""

from __future__ import annotations

import argparse
import json
import math
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd


def make_demo_data(seed: int) -> pd.DataFrame:
    """生成模拟数据：y = 3 + 2*x1 - 1.5*x2 + 噪声，不是真实实验数据。"""
    rng = np.random.default_rng(seed)
    x1 = rng.uniform(0, 10, 120)
    x2 = rng.uniform(-3, 3, 120)
    y = 3 + 2 * x1 - 1.5 * x2 + rng.normal(0, 0.8, 120)
    return pd.DataFrame({"x1": x1, "x2": x2, "y": y})


def prepare_data(data: pd.DataFrame, target: str, features: list[str] | None):
    """检查变量并生成自变量矩阵 X 和因变量向量 y。"""
    if target not in data.columns:
        raise ValueError(f"目标列不存在：{target}。可用列：{list(data.columns)}")
    features = features if features is not None else [c for c in data.columns if c != target]
    if not features or len(set(features)) != len(features):
        raise ValueError("请至少选择一个自变量，自变量名称不能重复。")
    if target in features:
        raise ValueError("目标列不能同时作为自变量，否则会产生数据泄漏。")
    missing = [name for name in features if name not in data.columns]
    if missing:
        raise ValueError(f"自变量列不存在：{missing}")

    try:
        numeric = data[features + [target]].apply(pd.to_numeric, errors="raise")
    except (TypeError, ValueError) as error:
        raise ValueError("请选择数值列；类别变量需要先进行编码。") from error
    if not np.isfinite(numeric.to_numpy(dtype=float)).all():
        raise ValueError("数据包含缺失值或无穷值，请先清洗数据。")
    if len(numeric) < 10:
        raise ValueError("至少需要 10 个样本，以便划分训练集和测试集。")
    return numeric[features], numeric[target]


def evaluate(actual, predicted) -> dict:
    """报告 R²、RMSE 和 MAE；真实值恒定时不报告无定义的 R²。"""
    actual = np.asarray(actual, dtype=float)
    residual = actual - predicted
    total = float(np.sum((actual - np.mean(actual)) ** 2))
    return {
        "R2": float(1 - np.sum(residual ** 2) / total) if total > 0 else None,
        "RMSE": float(np.sqrt(np.mean(residual ** 2))),
        "MAE": float(np.mean(np.abs(residual))),
    }


def run(args: argparse.Namespace) -> Path:
    data = pd.read_csv(args.csv, encoding="utf-8-sig") if args.csv else make_demo_data(args.seed)
    x, y = prepare_data(data, args.target, args.features)
    indices = np.random.default_rng(args.seed).permutation(len(x))
    test_count = math.ceil(len(x) * args.test_size)
    test_indices, train_indices = indices[:test_count], indices[test_count:]
    x_train, x_test = x.iloc[train_indices], x.iloc[test_indices]
    y_train, y_test = y.iloc[train_indices], y.iloc[test_indices]
    if len(x_train) < x.shape[1] + 2 or len(x_test) < 2:
        raise ValueError("划分后训练或测试样本不足，请增加数据、减少自变量或调整 --test-size。")

    # 拟合截距与各自变量系数，不显式计算 (XᵀX)⁻¹，以避免求逆带来的数值问题。
    train_design = np.column_stack((np.ones(len(x_train)), x_train.to_numpy(dtype=float)))
    test_design = np.column_stack((np.ones(len(x_test)), x_test.to_numpy(dtype=float)))
    coefficients, _, rank, _ = np.linalg.lstsq(train_design, y_train.to_numpy(dtype=float), rcond=None)
    train_prediction = train_design @ coefficients
    test_prediction = test_design @ coefficients
    metrics = {
        "data_source": str(args.csv) if args.csv else "synthetic_demo",
        "target": args.target,
        "features": list(x.columns),
        "seed": args.seed,
        "train_samples": len(x_train),
        "test_samples": len(x_test),
        "train": evaluate(y_train, train_prediction),
        "test": evaluate(y_test, test_prediction),
    }

    equation = f"{args.target} = {coefficients[0]:.6g}"
    for name, coefficient in zip(x.columns, coefficients[1:]):
        equation += f" {coefficient:+.6g} * {name}"
    print("数据来源：" + (str(args.csv) if args.csv else "内置模拟数据（非真实实验结果）"))
    print(f"训练样本：{len(x_train)}，测试样本：{len(x_test)}")
    print("回归方程：" + equation)
    for split, label in [("train", "训练集"), ("test", "测试集")]:
        score = metrics[split]
        r2 = f"{score['R2']:.6f}" if score["R2"] is not None else "不适用（真实值恒定）"
        print(f"{label}：R2={r2}，RMSE={score['RMSE']:.6f}，MAE={score['MAE']:.6f}")
    if rank < train_design.shape[1]:
        print("注意：自变量存在完全共线性，回归系数不能唯一确定，请检查冗余变量。")

    # 使用带微秒时间戳的新目录，避免覆盖此前的建模结果。
    result_dir = args.output_dir / datetime.now().strftime("run_%Y%m%d_%H%M%S_%f")
    result_dir.mkdir(parents=True, exist_ok=False)
    coefficient_table = pd.DataFrame({
        "term": ["intercept"] + list(x.columns),
        "coefficient": coefficients.tolist(),
    })
    coefficient_table.to_csv(result_dir / "coefficients.csv", index=False, encoding="utf-8-sig")
    predictions = pd.DataFrame({
        "sample_index": x_test.index,
        "actual": y_test.to_numpy(),
        "predicted": test_prediction,
        "residual": y_test.to_numpy() - test_prediction,
    }, index=x_test.index)
    predictions = pd.concat([predictions, x_test.add_prefix("feature:")], axis=1)
    predictions.to_csv(result_dir / "test_predictions.csv", index=False, encoding="utf-8-sig")
    (result_dir / "metrics.json").write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2, allow_nan=False), encoding="utf-8"
    )
    if not args.csv:
        data.to_csv(result_dir / "demo_data.csv", index=False, encoding="utf-8-sig")
    print(f"结果目录：{result_dir.resolve()}")
    return result_dir


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--csv", type=Path, help="CSV 数据文件路径；不提供时运行模拟示例")
    parser.add_argument("--target", default="y", help="目标列名称，默认 y")
    parser.add_argument("--features", nargs="+", help="自变量列名；默认选择目标列之外的所有列")
    parser.add_argument("--test-size", type=float, default=0.2, help="测试集比例，默认 0.2")
    parser.add_argument("--seed", type=int, default=42, help="随机种子，默认 42")
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parent / "linear_regression_results")
    args = parser.parse_args()
    if not 0 < args.test_size < 1:
        parser.error("--test-size 必须在 0 和 1 之间。")
    try:
        run(args)
    except (ValueError, OSError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
